'use client'
import React,{useEffect} from 'react';
import Link from 'next/link';

const FooterTwo = () => {
  useEffect(() => {
    if (!!window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active-footer");
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: "0px 0px -100px 0px"
      });

      document.querySelectorAll('.has-footer-animation').forEach(block => {
        observer.observe(block);
      });
    } else {
      document.querySelectorAll('.has-footer-animation').forEach(block => {
        block.classList.remove('has-footer-animation');
      });
    }
  }, []);
  return (
    <footer className="footer-style-two has-footer-animation">
        <div className="footer__country">
            <div className="container custom-container">
                <div className="row">
                    <div className="col-6">
                        <div className="footer__country-name">
                            <h2 className="text">Read</h2>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="footer__country-name text-center text-sm-end">
                            <h2 className="text">The Market</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="footer__two-widgets">
            <div className="container custom-container">
                <div className="row">
                    <div className="col-md-4 col-sm-7 order-1 order-md-0">
                        <div className="footer-el-widget">
                            <h4 className="title">Product</h4>
                            <ul className="list-wrap">
                                <li><Link href="/">Home</Link></li>
                                <li><Link href="/#features">Features</Link></li>
                                <li><Link href="/strategies">Strategies</Link></li>
                                <li><Link href="/pricing">Pricing</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md-4 d-none d-md-block order-0 order-md-2" aria-hidden="true" />
                    <div className="col-md-4 col-sm-7 order-3">
                        <div className="footer-el-widget text-start text-md-end">
                            <h4 className="title">Company</h4>
                            <ul className="list-wrap">
                                <li><Link href="/register">Get started</Link></li>
                                <li><Link href="/login">Sign in</Link></li>
                                <li>AI trading analyst<br/>Built for operators</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="copyright__wrap -style-two">
            <div className="container custom-container">
                <div className="row align-items-center">
                    <div className="col-lg-6">
                        <div className="copyright__text text-center text-lg-start">
                            <p>Copyright © {new Date().getFullYear()} - All Rights Reserved By <span>Denaro</span></p>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="copyright__menu">
                            <ul className="list-wrap d-flex flex-wrap justify-content-center justify-content-lg-end">
                                <li><Link href="/pricing">Pricing</Link></li>
                                <li><Link href="/register">Get started</Link></li>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default FooterTwo;
