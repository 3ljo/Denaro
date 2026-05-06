"use client"
import { selectProducts } from "@t/redux/features/productSlice";
import { useState } from "react";
import { useSelector } from "react-redux";

const useProducts = () => {
   const [products, setProducts] = useState(useSelector(selectProducts))
   return {
      products,
      setProducts
   }
}

export default useProducts