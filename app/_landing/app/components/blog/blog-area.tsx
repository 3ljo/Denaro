"use client"
import BlogSidebar from "./blog-sidebar";
import blog_data from "@t/data/blog-data";
import BlogItem from "./blog-item";
import { useState } from "react";
import ReactPaginate from "react-paginate";

const BlogArea = () => {

  const blog = blog_data;

  const itemsPerPage = 3;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = blog.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(blog.length / itemsPerPage);
  // click to request another page.
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % blog.length;
    setItemOffset(newOffset);
  };

  return (
    <section className="blog-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="blog-post-wrapper">
            {currentItems.map((blog) => (
              <BlogItem key={blog.id} blog={blog} />
            ))}
            <div className="pagination__wrap">
              <ReactPaginate
                breakLabel="..."
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                nextLabel={<i className="fas fa-angle-double-right"></i>}
                pageCount={pageCount}
                renderOnZeroPageCount={null}
                className="list-wrap d-flex flex-wrap justify-content-center"
                activeClassName="current"
                previousLabel={<i className="fas fa-angle-double-left"></i>}
                breakLinkClassName="break-me"
              />
            </div>
          </div>
          <div className="blog-post-sidebar">
            {/* blog sidebar start */}
            <BlogSidebar />
            {/* blog sidebar end */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogArea;
