'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import bg_img from '@t/assets/img/bg/team_bg.jpg';
import product from "@t/assets/img/products/product01.jpg"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@t/redux/store";
import useCartInfo from "@t/hooks/useCartInfo";
import { addToCart, CartProduct, clear_cart, decrease_quantity, remove_cart_product } from "@t/redux/features/cartSlice";


export default function CartArea() {

   const productItem = useSelector((state: RootState) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = useCartInfo();

   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
   }, []);

   if (!isClient) {
      return <div className="text-center py-5">Loading cart...</div>;
   }

   return (
      <div className="cart__area team-bg section-pt-120 section-pb-120" style={{ backgroundImage: `url(${bg_img.src})` }}>
         <div className="container">
            {productItem.length === 0 ? (
               <div className="mb-30">
                  <div className="empty_bag text-center">
                     <p className="py-3">Your Bag is Empty</p>
                     <Link href={"/product"}>
                        <button className="btn">Go To Shop</button>
                     </Link>
                  </div>
               </div>
            ) : (
               <div className="row">
                  <div className="col-lg-8">
                     <table className="table cart__table">
                        <thead>
                           <tr>
                              <th className="product__thumb">&nbsp;</th>
                              <th className="product__name">Product</th>
                              <th className="product__price">Price</th>
                              <th className="product__quantity">Quantity</th>
                              <th className="product__subtotal">Subtotal</th>
                              <th className="product__remove">&nbsp;</th>
                           </tr>
                        </thead>
                        <tbody>

                           {productItem.map((item: CartProduct) => (
                              <tr key={item.id}>
                                 <td className="product__thumb">
                                    <Link href="/shop-details">
                                       <Image src={item.thumb} alt="prd-img" />
                                    </Link>
                                 </td>
                                 <td className="product__name">
                                    <Link href="/shop-details">{item.title}</Link>
                                 </td>
                                 <td className="product__price">${item.price}.00</td>
                                 <td className="product__quantity">
                                    <div className="shop__details-qty">
                                       <form action="#" className="quantity num-block">
                                          <input type="text" className="in-num" value={item.quantity} readOnly />
                                          <div className="qtybutton-box">
                                             <span onClick={() => dispatch(addToCart(item))} className="plus"><i className="fas fa-angle-up"></i></span>
                                             <span onClick={() => dispatch(decrease_quantity(item))} className="minus dis"><i className="fas fa-angle-down"></i></span>
                                          </div>
                                       </form>
                                    </div>
                                 </td>
                                 <td className="product__subtotal">${item.price * item.quantity}.00</td>
                                 <td className="product__remove">
                                    <a style={{ cursor: "pointer" }} onClick={() => dispatch(remove_cart_product(item))}>×</a>
                                 </td>
                              </tr>
                           ))}

                           <tr>
                              <td colSpan={6} className="cart__actions">
                                 <form action="#" className="cart__actions-form">
                                    <input type="text" placeholder="Coupon code" />
                                    <button type="submit" className="btn">Apply coupon</button>
                                 </form>
                                 <div className="update__cart-btn text-end f-right">
                                    <button onClick={() => dispatch(clear_cart())} type="submit" className="btn">Update cart</button>
                                 </div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  <div className="col-lg-4">
                     <div className="cart__collaterals-wrap">
                        <h2 className="title">Cart totals</h2>
                        <ul className="list-wrap">
                           <li>Subtotal <span>${total.toFixed(2)}.00</span></li>
                           <li>Total <span className="amount">${total.toFixed(2)}.00</span></li>
                        </ul>
                        <Link href="/checkout" className="btn">Proceed to checkout</Link>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}
