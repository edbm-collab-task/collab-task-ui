import { useContext } from "react";
import { RecoveryAuthContext } from "@/contexts/RecoveryAuthProvider";

export default function useRecoveryAuth() {

    const context = useContext(RecoveryAuthContext);

    if (!context) {
        throw new Error("useRecoveryAuth must be used inside RecoveryAuthProvider");
    }

    return context;
}