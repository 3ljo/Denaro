import { StaticImageData } from "next/image";
import product_1 from "@t/assets/img/products/product01.jpg";
import product_2 from "@t/assets/img/products/product02.jpg";
import product_3 from "@t/assets/img/products/product03.jpg";
import product_4 from "@t/assets/img/products/product04.jpg";
import product_5 from "@t/assets/img/products/product05.jpg";
import product_6 from "@t/assets/img/products/product06.jpg";
import product_7 from "@t/assets/img/products/product07.jpg";
import product_8 from "@t/assets/img/products/product08.jpg";
import product_9 from "@t/assets/img/products/product09.jpg";
import product_10 from "@t/assets/img/products/product-6-1.png";
import product_11 from "@t/assets/img/products/product-6-2.png";
import product_12 from "@t/assets/img/products/product-6-3.png";
import product_13 from "@t/assets/img/products/product-6-4.png";
import product_14 from "@t/assets/img/products/product-6-5.png";
import product_15 from "@t/assets/img/products/product-6-6.png";
import product_16 from "@t/assets/img/products/product-6-7.png";
import product_17 from "@t/assets/img/products/product-6-8.png";

interface ProductData {
  id: number;
  thumb: StaticImageData;
  title: string;
  price: number;
  rating: number;
  status: string;
  total_rating: number;
  description: string;
  category: string;
}

const product_data: ProductData[] = [
  {
    id: 1,
    thumb: product_1,
    title: "Nintendo Switch",
    price: 29,
    category: "E-SPORTS",
    description: "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 20,
  },
  {
    id: 2,
    thumb: product_2,
    title: "Headphone",
    price: 69,
    category: "accessories",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 4,
    total_rating: 30,
  },
  {
    id: 3,
    thumb: product_3,
    title: "replica Axe",
    price: 39,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 40,
  },
  {
    id: 4,
    thumb: product_4,
    title: "ps5 controller",
    price: 49,
    category: "accessories",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 3,
    total_rating: 25,
  },
  {
    id: 5,
    thumb: product_5,
    title: "Golden Crown",
    price: 19,
    category: "gaming",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 30,
  },
  {
    id: 6,
    thumb: product_6,
    title: "gaming mouse",
    price: 59,
    category: "accessories",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 45,
  },
  {
    id: 7,
    thumb: product_7,
    title: "Headphone - X",
    price: 29,
    category: "accessories",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 48,
  },
  {
    id: 8,
    thumb: product_8,
    title: "replica gun",
    price: 49,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 20,
  },
  {
    id: 9,
    thumb: product_9,
    title: "gun robot",
    price: 109,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
    rating: 5,
    total_rating: 20,
  },
];

export default product_data;

export const product_data_two: ProductData[] = [
  {
    id: 10,
    thumb: product_10,
    title: "Wired Headphone With Mic",
    price: 79.99,
    rating: 5.0,
    total_rating: 20,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 11,
    thumb: product_11,
    title: "Xbox Wireless Controller",
    price: 69.99,
    rating: 4.8,
    total_rating: 30,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 12,
    thumb: product_12,
    total_rating: 24,
    title: "Streaming Microphone",
    price: 49.99,
    rating: 3.9,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 13,
    thumb: product_13,
    title: "XGear A8 Laptop Desk",
    price: 39.99,
    rating: 5.0,
    total_rating: 35,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 14,
    thumb: product_14,
    title: "Reality Motion Controller",
    price: 89.99,
    rating: 3.8,
    total_rating: 40,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 15,
    thumb: product_15,
    title: "Mini Portable Speaker 2.0",
    price: 29.99,
    rating: 2.6,
    total_rating: 20,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 16,
    thumb: product_16,
    title: "Logitech G502 X PLUS Mouse",
    price: 39.99,
    rating: 4.8,
    total_rating: 30,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
  {
    id: 17,
    thumb: product_17,
    title: "Microsoft Xbox Series S 10GB",
    price: 99.99,
    rating: 4.8,
    total_rating: 25,
    category: "E-SPORTS",
    description:
      "Lorem ipsum dolor sit amet, consteur adipiscing Duis elementum solliciin is yaugue euismods Nulla ullaorper.",
    status: "in-stock",
  },
];

export const all_products = [...product_data, ...product_data_two];
