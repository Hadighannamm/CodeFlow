import { useEffect,useState, createContext, useContext, createElement } from "react";
import type { ReactNode } from "react";
import type { AppUser } from "../types/auth";
import { getCurrentUser,
    signInWithEmail,
    signOutUser,
    signUpWithEmail,
    subscribeToAuthChanges
 } from "../services/authService";
import { supabase } from "../lib/supabaseClient";

function mapUser(user:{id:string; email?:string | null}|null):AppUser |null{
    if(!user) return null;
    return{
        id:user.id,
        email: user.email ?? null
    }
}

type AuthContextType = {
    user: AppUser | null;
    loading: boolean;
    error: string;
    successMessage: string;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthLogic();
    return createElement(
        AuthContext.Provider,
        { value: auth },
        children
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

function useAuthLogic(): AuthContextType {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setsuccessMessage] = useState("");

    useEffect(()=>{
        async function loadUser(){
            setLoading(true)
            setError("")
            const {data,error} = await getCurrentUser();

            if(error){
                setError(error.message)
                setLoading(false)
                return
            }
            setUser(mapUser(data.user))
            setLoading(false)
        }
        loadUser();
        const {data: {subscription},} = subscribeToAuthChanges((_event,session)=>{
            setUser(mapUser(session?.user??null));
        })

        return()=>{
            subscription.unsubscribe()
        }
     } ,[])

    // Load user role separately after user is authenticated
    useEffect(() => {
        if (!user?.id) return;

        const loadUserRole = async () => {
            try {
                const { data: profile, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (!error && profile?.role) {
                    setUser(prev => prev ? { ...prev, role: profile.role } : null);
                }
            } catch (err) {
                console.warn('Failed to load user role:', err);
                // Continue without role - not critical for auth flow
            }
        };

        loadUserRole();
    }, [user?.id])
      async function signUp(email:string, password:string, firstName: string = '', lastName: string = ''){
            setError("");
            setsuccessMessage("");
            const {error} = await signUpWithEmail(email, password, firstName, lastName);
            if(error){
                setError(error.message)
                return false;
            }
            setsuccessMessage("Account Created!!!")
            return true
        }
  async function signIn(email:string, password:string){
            setError("");
            setsuccessMessage("");
            const result = await signInWithEmail(email,password);
            
            if(result.error){
                const errorMessage = (result.error as any).message || 'Sign in failed. Please try again.';
                console.log('Sign in error set to:', errorMessage);
                setError(errorMessage);
                return false;
            }
            
            setsuccessMessage("Signed in successfully!")
            return true
        }

        async function signOut(){
            setError("");
            setsuccessMessage("");
            const {error} = await signOutUser();
             if(error){
                setError(error.message)
                return false;
            }
            setsuccessMessage("Signed out success!!")
            return true
        }
     
       
      return{
            user,
            loading,
            error,
            successMessage,
            signUp,
            signIn,
            signOut,
        
        }  
}