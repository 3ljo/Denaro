'use client'
import Link from 'next/link';
import product_data from '@t/data/product-data';
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectProducts } from "@t/redux/features/productSlice";
import Image, { StaticImageData } from "next/image";
import { Product } from '@t/types/product-type';
import PriceRange from './price-range';

interface FilterCriteria {
    category: string;
}

interface DataType {
    id: number;
    img: StaticImageData;
    title: string;
    price: number;
}

interface ShopSidebarProps {
    setProducts: (products: Product[]) => void;
}

const ShopSidebar = ({ setProducts }: ShopSidebarProps) => {
    const related__products = product_data.slice(0, 2);

    const [categorySelected, setCategorySelected] = useState('');

    const categoryFilter = useSelector(selectProducts).map(product => product.category);

    const allCategory = ['All Category', ...new Set(categoryFilter)];

    const allProducts = useSelector(selectProducts);

    // Handle category selection
    const handleCategory = (category: string) => {
        setCategorySelected(prevCategory => prevCategory === category ? '' : category);
        filterProducts({ category: category === categorySelected ? '' : category });
    };

    const filterProducts = ({ category }: FilterCriteria) => {
        let filteredProducts = allProducts;

        if (category && category !== 'All Category') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }

        setProducts(filteredProducts);
    };


    // handle Price
    const maxPrice = allProducts.reduce((max, item) => {
        return item.price > max ? item.price : max;
    }, 0);

    const [priceValue, setPriceValue] = useState([0, maxPrice]);

    useEffect(() => {
        const filterPrice = allProducts.filter(
            (j) => j.price >= priceValue[0] && j.price <= priceValue[1]
        );
        setProducts(filterPrice);
    }, [priceValue, allProducts, setProducts]);


    const handleChanges = (val: number[]) => {
        setPriceValue(val)
    }

    return (
        <aside className="shop-sidebar">
            <div className="shop__widget">
                <h4 className="shop__widget-title">search</h4>
                <div className="shop__widget-inner">
                    <div className="shop__search">
                        <input type="text" placeholder="Search here" />
                        <button className="p-0 border-0"><i className="flaticon-search"></i></button>
                    </div>
                </div>
            </div>
            <div className="shop__widget">
                <h4 className="shop__widget-title">filter by price</h4>
                <div className="shop__widget-inner">
                    <div className="shop__price-filter">
                        <div id="slider-range">
                            <PriceRange
                                MAX={maxPrice}
                                MIN={0}
                                STEP={1}
                                values={priceValue}
                                handleChanges={handleChanges}
                            />
                        </div>
                        <div className="shop__price-slider-amount">
                            <input type="submit" className="p-0 border-0" value="Filter" />
                            {/* <input type="text" id="amount" name="price" placeholder="Add Your Price" /> */}
                            <span className="" onChange={() => handleChanges}>
                                ${priceValue[0]} - ${priceValue[1]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="shop__widget">
                <h4 className="shop__widget-title">Categories</h4>
                <div className="shop__widget-inner">
                    <ul className="product-categories list-wrap">
                        {allCategory.map((category, i) => {
                            const categoryCount = category === 'All Category'
                                ? allProducts.length
                                : allProducts.filter(product => product.category === category).length;

                            return (
                                <li key={i} onClick={() => handleCategory(category)}>
                                    <a style={{ cursor: "pointer" }}>{category} <span className="float-right">({categoryCount})</span></a>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="shop__widget">
                <h4 className="shop__widget-title">Related products</h4>
                <div className="shop__widget-inner">
                    {related__products.map((item) => (
                        <div key={item.id} className="related__products-item">
                            <div className="related__products-thumb">
                                <Link href={`/shop-details/${item.id}`}>
                                    <Image src={item.thumb} alt="img" />
                                </Link>
                            </div>
                            <div className="related__products-content">
                                <h4 className="product-name">
                                    <Link href={`/shop-details/${item.id}`}>{item.title}</Link>
                                </h4>
                                <span className="amount">${item.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ShopSidebar;