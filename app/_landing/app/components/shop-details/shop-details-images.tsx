"use client";

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

// images
import nav_1 from "@t/assets/img/products/shop_nav01.jpg";
import nav_2 from "@t/assets/img/products/shop_nav02.jpg";
import nav_3 from "@t/assets/img/products/shop_nav03.jpg";

import nav_active_1 from "@t/assets/img/products/shop_details01.jpg";
import nav_active_2 from "@t/assets/img/products/shop_details02.jpg";
import nav_active_3 from "@t/assets/img/products/shop_details03.jpg";

// thumbnail images
const navImages: StaticImageData[] = [nav_1, nav_2, nav_3];

// main images
const activeImages: StaticImageData[] = [
    nav_active_1,
    nav_active_2,
    nav_active_3,
];

const ShopDetailsImages = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    return (
        <div className="shop__details-images-wrap">
            {/* Thumbnails */}
            <ul className="nav nav-tabs" id="imageTab" role="tablist">
                {navImages.map((img, index) => (
                    <li key={index} className="nav-item" role="presentation">
                        <button
                            type="button"
                            className={`nav-link ${index === currentImageIndex ? "active" : ""
                                }`}
                            onClick={() => setCurrentImageIndex(index)}
                        >
                            <Image src={img} alt="Product thumbnail" />
                        </button>
                    </li>
                ))}
            </ul>

            {/* Main Image */}
            <div className="tab-content" id="imageTabContent">
                <PhotoProvider>
                    {activeImages.map((img, index) => (
                        <div
                            key={index}
                            className={`tab-pane fade ${index === currentImageIndex ? "show active" : ""
                                }`}
                            id={`item${index}`}
                            role="tabpanel"
                        >
                            <PhotoView src={img.src}>
                                <a className="popup-image pointer">
                                    <Image
                                        src={img}
                                        alt="Product image"
                                        style={{ height: "auto", width: "100%" }}
                                        priority={index === currentImageIndex}
                                    />
                                </a>
                            </PhotoView>
                        </div>
                    ))}
                </PhotoProvider>
            </div>
        </div>
    );
};

export default ShopDetailsImages;
