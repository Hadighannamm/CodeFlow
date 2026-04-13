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
    
    // Handle email not confirmed error
    if (result.error?.message.includes('Email not confirmed')) {
        return {
            error: {
                message: 'Please confirm your email first. Check your inbox for the confirmation link.',
                status: 400
            }
        };
    }
    
    if (result.error) {
        return result;
    }
    
    // Ensure user profile exists (in case of sign in after account deletion)
    if (result.data.user) {
        try {
            // Check if user profile exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', result.data.user.id)
                .single();
            
            // Only create if doesn't exist
            if (!existingUser) {
                await supabase
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
            }
        } catch (error) {
            // Profile might exist, continue anyway
            console.log('Profile check complete');
        }
    }
    
    return result;
}

export async function signOutUser(){
    return await supabase.auth.signOut();
}

export async function getCuurentUser(){
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