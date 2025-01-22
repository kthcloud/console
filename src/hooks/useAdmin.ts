import { useContext } from "react";
import { AdminResourceContext } from "../contexts/AdminResourceContext";
const useAdmin = () => useContext(AdminResourceContext);

export default useAdmin;
