import { selectProducts } from "@t/redux/features/productSlice";
import { useSelector } from "react-redux";
import { ChangeEvent, useState } from "react";
import { Product } from "@t/types/product-type";

interface ProductTopProps {
   startOffset: number;
   endOffset: number;
   totalItems: number;
   setProducts: (products: Product[]) => void;
}

const ProductTop = ({ startOffset, endOffset, totalItems, setProducts }: ProductTopProps) => {
   const allProducts = useSelector(selectProducts);
   const [selected, setSelected] = useState('');

   const selectHandler = (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      setSelected(value);

      let sortedProducts = [...allProducts];

      switch (value) {
         case "rating":
            sortedProducts.sort(
               (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
            );
            break;

         case "price":
            sortedProducts.sort((a, b) => a.price - b.price);
            break;

         case "latest":
            sortedProducts.sort((a, b) => b.id - a.id);
            break;

         default:
            sortedProducts = [...allProducts];
            break;
      }

      setProducts(sortedProducts);
   };

   return (
      <>
         <div className="shop__top-wrap">
            <div className="row align-items-center">
               <div className="col-lg-8 col-sm-6">
                  <div className="shop__showing-result">
                     <p>Showing {startOffset}-{endOffset} of {totalItems} results</p>
                  </div>
               </div>
               <div className="col-lg-4 col-sm-6">
                  <div className="shop__ordering">
                     <select onChange={selectHandler} value={selected} name="orderby" className="orderby">
                        <option defaultValue="Default sorting">Default sorting</option>
                        <option defaultValue="rating">Sort by average rating</option>
                        <option value="price">Sort by Price</option>
                        <option defaultValue="Sort by latest">Sort by latest</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>
      </>
   )
}

export default ProductTop
