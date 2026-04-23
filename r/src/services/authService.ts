import { supabase } from "../lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export async function signUpWithEmail(email:string, password:string, firstName: string = '', lastName: string = ''){
    const result = await supabase.auth.signUp({
        email,password
    });
    
    if (result.error) {
        return result;
    }
    
    // Create user profile in users table
    if (result.data.user) {
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: result.data.user.id,
                email: email,
                username: email.split('@')[0], // Use email prefix as default username
                first_name: firstName,
                last_name: lastName,
                reputation: 0,
                bio: '',
                avatar_url: null,
            });
        
        if (profileError) {
            console.error('Error creating user profile:', profileError);
            // Don't fail the signup, just log the error
        }
    }
    
    // Return success with message about confirmation email
    return {
        ...result,
        data: {
            ...result.data,
            message: 'Account created successfully!'
        }
    };
}

export async function signInWithEmail(email:string, password:string){
    const result = await supabase.auth.signInWithPassword({
        email,password
    });

    // Handle specific error cases
    if (result.error) {
        if (result.error.message.includes('Email not confirmed')) {
            return {
                error: {
                    message: 'Please confirm your email first. Check your inbox for the confirmation link.',
                    status: 400
                }
            };
        }

        if (result.error.message.includes('Invalid login credentials')) {
            return {
                error: {
                    message: 'Invalid email or password. Please check your credentials and try again.',
                    status: 400
                }
            };
        }

        // Return the original error for other cases
        return result;
    }
    
    // Ensure user profile exists (in case of sign in after account deletion)
    if (result.data.user) {
        try {
            // Check if user profile exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('id', result.data.user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
                console.warn('Error checking user profile:', checkError);
                // Continue anyway - profile check is not critical for login
            }

            // Create profile when not found (PGRST116) or when empty without an error.
            if (!existingUser && (!checkError || checkError.code === 'PGRST116')) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: result.data.user.id,
                        email: email,
                        username: email.split('@')[0],
                        first_name: '',
                        last_name: '',
                        reputation: 0,
                        bio: '',
                        avatar_url: null,
                    });

                if (insertError) {
                    console.warn('Error creating user profile during sign in:', insertError);
                    // Don't fail the sign in, just log the error
                }
            }
        } catch (error) {
            console.warn('Profile management error during sign in:', error);
            // Continue with sign in even if profile operations fail
        }
    }
    
    // Check account status after successful authentication
    if (result.data.user) {
        try {
            const { data: userProfile, error: statusError } = await supabase
                .from('users')
                .select('status')
                .eq('id', result.data.user.id)
                .single();

            if (statusError) {
                console.warn('Error checking account status:', statusError);
                // Continue if profile doesn't exist yet
            }

            // If account is suspended or banned, sign out and return error
            if (userProfile?.status === 'suspended') {
                await supabase.auth.signOut();
                return {
                    data: null,
                    error: {
                        message: 'Your account was suspended by the admin.',
                        status: 403,
                        code: 'account_suspended'
                    }
                };
            }

            if (userProfile?.status === 'banned') {
                await supabase.auth.signOut();
                return {
                    data: null,
                    error: {
                        message: 'Your account has been banned.',
                        status: 403,
                        code: 'account_banned'
                    }
                };
            }
        } catch (err) {
            console.warn('Error checking account status:', err);
            // Continue with sign in if status check fails
        }
    }
    
    return result;
}

export async function signOutUser(){
    return await supabase.auth.signOut();
}

export async function getCurrentUser(){
    return await supabase.auth.getUser();
}

export async function resendConfirmationEmail(email: string) {
    return await supabase.auth.resend({
        type: 'signup',
        email,
    });
}

export function subscribeToAuthChanges(
    callback: (event:AuthChangeEvent, session: Session| null) => void
){
    return supabase.auth.onAuthStateChange(callback);
}