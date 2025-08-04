import { useEffect, useState } from "react";
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

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");

const facebookProvider = new FacebookAuthProvider();

const AuthProvider = ({ children }) => {
  const axiosInstance = useAxios();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userEmail = user?.email || user?.providerData?.[0]?.email || "";

  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const updateUserProfile = (profileInfo) => {
    return updateProfile(auth.currentUser, profileInfo);
  };

  const sendVerificationEmail = () => {
    setLoading(true);
    return sendEmailVerification(auth.currentUser);
  };

  const continueWithGoogle = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const continueWithFacebook = () => {
    setLoading(true);
    return signInWithPopup(auth, facebookProvider);
  };

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logOutUser = async () => {
    setLoading(true);
    queryClient.clear();
    await axiosInstance.post("/logout");
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const email = currentUser.email || currentUser.providerData[0].email;
        await axiosInstance.post("/jwt", {
          email,
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [axiosInstance]);

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
