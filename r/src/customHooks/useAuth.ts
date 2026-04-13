import { useEffect,useState, createContext, useContext, createElement } from "react";
import type { ReactNode } from "react";
import type { AppUser } from "../types/auth";
import { getCuurentUser,
    signInWithEmail,
    signOutUser,
    signUpWithEmail,
    subscribeToAuthChanges
 } from "../services/authService";

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
            const {data,error} = await getCuurentUser();

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
      async function signUp(email:string, passowrd:string, firstName: string = '', lastName: string = ''){
            setError("");
            setsuccessMessage("");
            const {error} = await signUpWithEmail(email, passowrd, firstName, lastName);
            if(error){
                setError(error.message)
                return false;
            }
            setsuccessMessage("Account Created!!!")
            return true
        }
  async function signIn(email:string, passowrd:string){
            setError("");
            setsuccessMessage("");
            const {error} = await signInWithEmail(email,passowrd);
            if(error){
                setError(error.message)
                return false;
            }
            setsuccessMessage("Account Created!!!")
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