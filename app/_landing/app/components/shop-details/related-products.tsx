"use client"
import useProducts from "@t/hooks/useProducts";
import { addToCart } from "@t/redux/features/cartSlice";
import { Product } from "@t/types/product-type";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

const RelatedProducts = () => {

  const dispatch = useDispatch();
  const { products, setProducts } = useProducts();
  const related_prd = products.slice(0, 4);

  const handleAddToCart = useCallback(
    (item: Product) => {
      dispatch(addToCart(item));
    },
    [dispatch]
  );

  return (
    <div className="related__product-wrapper">
      <h2 className="related-title">Related Products</h2>
      <div className="row justify-content-center row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-sm-2 row-cols-1">
        {related_prd.map((item) => (
          <div key={item.id} className="col">
            <div className="shop__item">
              <div className="shop__item-thumb">
                <Link href={`/shop-details/${item.id}`}>
                  <Image src={item.thumb} alt="img" />
                </Link>
                <a onClick={() => handleAddToCart(item)} style={{ cursor: "pointer" }} className="wishlist-button">
                  <i className="fas fa-shopping-cart"></i>
                </a>
              </div>
              <div className="shop__item-line"></div>
              <div className="shop__item-content">
                <div className="shop__item-content-top">
                  <h4 className="title">
                    <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
                  </h4>
                  <div className="shop__item-price">${item.price}</div>
                </div>
                <div className="shop__item-cat">
                  <Link href="/shop">{item.category}</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
