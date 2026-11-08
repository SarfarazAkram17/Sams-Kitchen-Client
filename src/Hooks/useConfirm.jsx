import { use } from "react";
import { ConfirmContext } from "../Contexts/Confirm/ConfirmContext";

// `const confirm = useConfirm(); if (await confirm({ title, message, tone: "danger" })) ...`
const useConfirm = () => use(ConfirmContext);

export default useConfirm;
