import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer, Slide, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="light"
        transition={Bounce}   // 🔥 Animation Here
        toastClassName="rounded-xl shadow-lg"
        bodyClassName="text-sm font-medium"
        progressClassName="bg-gradient-to-r from-green-400 to-blue-500"
      />
  <AppRoutes />
    </>
)}

export default App;