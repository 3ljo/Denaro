'use client'
import { useCallback, useState } from 'react';
import Link from 'next/link';
import RelatedProducts from './related-products';
import ShopDetailsImages from './shop-details-images';
import { Product } from '@t/types/product-type';
import { Rating } from "react-simple-star-rating";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@t/redux/store';
import { addToCart, decrease_quantity } from '@t/redux/features/cartSlice';

const tab_title: string[] = ["Description", "Additional Information", "Reviews (0)"]

interface ProductData {
    product?: Product;
}

const ShopDetailsArea = ({ product }: ProductData) => {

    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    const [model, setModel] = useState<string>('Gat');

    const productItem = useSelector((state: RootState) => state.cart.cart);
    const dispatch = useDispatch();

    const handleAddToCart = useCallback(
        (item: Product) => {
            dispatch(addToCart(item));
        },
        [dispatch]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const totalItems = productItem.find((d_item) => d_item?.id === product?.id)

    return (
        <>
            <section className="shop-area shop-details-area">
                <div className="container">
                    <div className="row">
                        {/* shop details images  */}
                        <ShopDetailsImages />
                        {/* shop details images  */}
                        <div className="shop__details-content">
                            <div className="shop__details-rating">
                                <Rating initialValue={product?.rating} size={17} readonly={true} />
                                <span className="rating-count">( {product?.total_rating} Customer Review )</span>
                            </div>
                            <h2 className="title">game controller</h2>
                            <div className="shop__details-price">
                                <span className="amount">${product?.price.toFixed(2)} <span className="stock-status">- {product?.status}</span></span>
                            </div>
                            <div className="shop__details-short-description">
                                <p>{product?.description}</p>
                            </div>
                            <div className="shop__details-model d-flex align-items-center">
                                <p className="model m-0">Model:</p>
                                <ul className="list-wrap d-flex align-items-center">
                                    <li onClick={() => setModel('Gat')} className={model === 'Gat' ? 'active' : ''}>Gat</li>
                                    <li onClick={() => setModel('dat4')} className={model === 'dat4' ? 'active' : ''}>dat4</li>
                                    <li onClick={() => setModel('rt30')} className={model === 'rt30' ? 'active' : ''}>rt30</li>
                                </ul>
                            </div>
                            <div className="shop__details-qty">
                                <div className="cart-plus-minus d-flex flex-wrap align-items-center">
                                    <form className="quantity num-block">
                                        <input type="text" className="in-num" onChange={handleSubmit} value={totalItems?.quantity ? totalItems?.quantity : 1} readOnly />
                                        <div className="qtybutton-box">
                                            <span onClick={() => product ? dispatch(addToCart(product)) : ""} className="plus"><i className="fas fa-angle-up"></i></span>
                                            <span onClick={() => product ? dispatch(decrease_quantity(product)) : ""} className="minus dis"><i className="fas fa-angle-down"></i></span>
                                        </div>
                                    </form>
                                    <button onClick={() => product ? handleAddToCart(product) : ""} className="shop__details-cart-btn">add to cart</button>
                                </div>
                            </div>
                            <div className="shop__details-bottom">
                                <div className="posted_in">
                                    <b>Categories :</b>
                                    <Link href="/shop">Gamdias,</Link>
                                    <Link href="/shop">Apple,</Link>
                                    <Link href="/shop">Huawei</Link>
                                </div>
                                <div className="tagged_as">
                                    <b>Tags :</b>
                                    <Link href="/shop">Silver,</Link>
                                    <Link href="/shop">Pink,</Link>
                                    <Link href="/shop">Green</Link>
                                </div>
                                <div className="product_share">
                                    <b>Share :</b>
                                    <Link href="/shop"><i className="fab fa-facebook-f"></i></Link>
                                    <Link href="/shop"><i className="fab fa-twitter"></i></Link>
                                    <Link href="/shop"><i className="fab fa-instagram"></i></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="product__desc-wrap">
                                <ul className="nav nav-tabs" id="descriptionTab" role="tablist">
                                    {tab_title.map((tab, index) => (
                                        <li key={index} onClick={() => handleTabClick(index)} className="nav-item" role="presentation">
                                            <button className={`nav-link ${activeTab === index ? "active" : ""}`}>{tab}</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="tab-content" id="descriptionTabContent">
                                    <div className={`tab-pane animation-none fade ${activeTab === 0 ? 'show active' : ''}`} id="description" role="tabpanel" aria-labelledby="description-tab">
                                        <p>Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industries standard dummy text
                                            ever since the 1500s.</p>
                                        <p>Do not look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there is not anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour.</p>
                                    </div>
                                    <div className={`tab-pane animation-none fade ${activeTab === 1 ? 'show active' : ''}`} id="info" role="tabpanel" aria-labelledby="info-tab">
                                        <table className="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <th scope="row">General</th>
                                                    <td>PS5 Digital Platform</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Technical Information</th>
                                                    <td>Qualcomm Snapdragon XR2</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Display</th>
                                                    <td>3664 x 1920</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">RAM & Storage</th>
                                                    <td>8GB/256GB</td>
                                                </tr>
                                                <tr>
                                                    <th scope="row">Included</th>
                                                    <td>PS5 VR Streaming Assistant</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className={`tab-pane animation-none fade ${activeTab === 2 ? 'show active' : ''}`} id="reviews">
                                        <div className="product__desc-review">
                                            <div className="product__desc-review-title mb-15">
                                                <h5 className="title">Customer Reviews (0)</h5>
                                            </div>
                                            <div className="left-rc">
                                                <p>No reviews yet</p>
                                            </div>
                                            <div className="right-rc">
                                                <Link href="#">Write a review</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="related__product-area">
                        {/* related products start */}
                        <RelatedProducts />
                        {/* related products end */}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ShopDetailsArea;