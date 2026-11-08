import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  FacebookAuthProvider,
} from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "../../Firebase/firebase.config";
import useAxios from "../../Hooks/useAxios";
import { clearCart } from "../../CartUtils/cartUtils";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");

const facebookProvider = new FacebookAuthProvider();

const emailOf = (firebaseUser) =>
  firebaseUser?.email || firebaseUser?.providerData?.[0]?.email || "";

// Email and password accounts count as signed in only after the address is verified.
const needsVerification = (firebaseUser) =>
  firebaseUser.providerData.some((info) => info.providerId === "password") &&
  !firebaseUser.emailVerified;

const AuthProvider = ({ children }) => {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessions = useRef(new Map());
  const userEmail = emailOf(user);

  // Starts the API session. A first-time sign-in has no account yet, so the
  // account is created (without a role; onboarding asks for it) and the
  // session is requested again.
  const startSession = useCallback(
    async (firebaseUser) => {
      const email = emailOf(firebaseUser);
      if (!email) {
        throw new Error("This sign-in method did not share an email address.");
      }

      try {
        await axiosInstance.post("/auth/jwt", { email });
      } catch (error) {
        if (error.response?.status !== 404) throw error;

        await axiosInstance.post("/users", {
          email,
          name: firebaseUser.displayName || "",
          photo: firebaseUser.photoURL || "",
          providerId: firebaseUser.providerData?.[0]?.providerId || "",
          createdAt: firebaseUser.metadata?.createdAt,
        });
        await axiosInstance.post("/auth/jwt", { email });
      }
    },
    [axiosInstance],
  );

  // Sign-in calls and the auth listener share one in-flight request per account.
  const applySession = useCallback(
    async (firebaseUser) => {
      try {
        if (!firebaseUser || needsVerification(firebaseUser)) {
          setUser(null);
          return;
        }

        const pending =
          sessions.current.get(firebaseUser.uid) ||
          startSession(firebaseUser).finally(() =>
            sessions.current.delete(firebaseUser.uid),
          );
        sessions.current.set(firebaseUser.uid, pending);

        try {
          await pending;
        } catch (error) {
          console.error("Could not start the session:", error);
        }
        setUser(firebaseUser);
      } finally {
        setLoading(false);
      }
    },
    [startSession],
  );

  const signInWith = async (signIn) => {
    setLoading(true);
    try {
      const result = await signIn();
      await applySession(result.user);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const createUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginUser = (email, password) =>
    signInWith(() => signInWithEmailAndPassword(auth, email, password));

  const continueWithGoogle = () =>
    signInWith(() => signInWithPopup(auth, googleProvider));

  const continueWithFacebook = () =>
    signInWith(() => signInWithPopup(auth, facebookProvider));

  const updateUserProfile = (profileInfo) =>
    updateProfile(auth.currentUser, profileInfo);

  const sendVerificationEmail = () => sendEmailVerification(auth.currentUser);

  const forgotPassword = (email) => sendPasswordResetEmail(auth, email);

  const logOutUser = async () => {
    setLoading(true);
    try {
      queryClient.clear();
      await axiosInstance.post("/auth/logout").catch(() => {});
      clearCart();
      await signOut(auth);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, applySession);
    return unsubscribe;
  }, [applySession]);

  const authInfo = {
    user,
    userEmail,
    loading,
    createUser,
    loginUser,
    updateUserProfile,
    sendVerificationEmail,
    continueWithGoogle,
    continueWithFacebook,
    forgotPassword,
    logOutUser,
  };

  return <AuthContext value={authInfo}>{children}</AuthContext>;
};

export default AuthProvider;
