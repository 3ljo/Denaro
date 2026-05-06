"use client";
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import ContextProvider from "@t/context/app-context";

type IProps = {
  children: React.ReactNode;
  bodyCls?: string;
}

const Wrapper = ({ children,bodyCls }:IProps) => {
  useEffect(() => {
    if(bodyCls){
      document.body.classList.add(bodyCls)
    }
    return () => {
      if(bodyCls){
        document.body.classList.remove(bodyCls)
      }
    }
  },[])
  return (
    <ContextProvider>
      {children}
      <ToastContainer />
    </ContextProvider>
  );
};

export default Wrapper;
