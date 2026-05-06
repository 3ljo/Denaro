'use client';
import ShopSidebar from './shop-sidebar';
import { useDispatch } from 'react-redux';
import useProducts from '@t/hooks/useProducts';
import { useCallback, useState } from 'react';
import { Product } from '@t/types/product-type';
import { addToCart } from '@t/redux/features/cartSlice';
import ProductTop from './product-top';
import ReactPaginate from 'react-paginate';
import Link from 'next/link';
import Image from 'next/image';

const ShopArea = () => {

    const dispatch = useDispatch();
    const { products, setProducts } = useProducts();

    const itemsPerPage = 6;
    const [itemOffset, setItemOffset] = useState(0);
    const filteredProducts = products;
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice(itemOffset, itemOffset + itemsPerPage);

    const startOffset = itemOffset + 1;
    const endOffset = Math.min(itemOffset + itemsPerPage, products.length);
    const totalItems = filteredProducts.length;

    const handlePageClick = ({ selected }: { selected: number }) => {
        const newOffset = selected * itemsPerPage;
        setItemOffset(newOffset);
    };

    const handleAddToCart = useCallback(
        (item: Product) => {
            dispatch(addToCart(item));
        },
        [dispatch]
    );
    return (
        <section className="shop-area">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-3 col-lg-4 col-md-11 order-2 order-lg-0">
                        {/* sidebar start */}
                        <ShopSidebar setProducts={setProducts} />
                        {/* sidebar end */}
                    </div>
                    <div className="col-xl-9 col-lg-8 col-md-11">

                        <ProductTop
                            startOffset={startOffset}
                            endOffset={Math.min(endOffset, totalItems)}
                            totalItems={totalItems}
                            setProducts={setProducts}
                        />
                        <div className="row justify-content-center row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-2 row-cols-1">
                            {currentItems.map((item) => (
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
                        <div className="pagination__wrap react-pagination">
                            <ReactPaginate
                                className="list-wrap d-flex flex-wrap justify-content-center"
                                breakLabel="..."
                                activeClassName="current"
                                breakLinkClassName="break-me"
                                nextLabel={<i className="fas fa-angle-double-right"></i>}
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={5}
                                pageCount={totalPages}
                                previousLabel={<i className="fas fa-angle-double-left"></i>}
                                renderOnZeroPageCount={null}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopArea;