// Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/images/logo.png";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { TbBrandYoutube } from "react-icons/tb";
import { PiTiktokLogo } from "react-icons/pi";

const Footer = () => {
    return (
        <footer className="footer w-full bg-black text-white py-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-flow-row-dense md:grid-cols-4 gap-10 px-4">

                <div className="footer-logo">
                    <Link to="/">
                        <img src={logo} alt="Logo" />
                    </Link>
                </div>

                {/* Store Information */}
                <div className="footer-section">
                    <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
                    <ul className="space-y-2 text-sm">
                        <li>Cửa hàng</li>
                        <li>Về Phê La</li>
                        <li>Hệ thống cửa hàng</li>
                    </ul>
                </div>

                {/* Company Information */}
                <div className="footer-section">
                    <h3 className="text-lg font-semibold mb-4">Địa chỉ công ty</h3>
                    <p className="text-sm leading-relaxed">
                        Trụ sở chính: 289 Đinh Bộ Lĩnh, phường 26, quận Bình Thạnh, TP Hồ Chí Minh<br />
                        Chi nhánh Đà Lạt: 7 Nguyễn Chí Thanh, phường 1, thành phố Đà Lạt, tỉnh Lâm Đồng<br />
                        Chi nhánh Hà Nội: Lô 04-9A Khu công nghiệp Vĩnh Hoàng, phường Hoàng Văn Thụ, quận Hoàng Mai, Hà Nội
                    </p>
                    <p className="mt-4 text-sm">
                        <strong>Email hỗ trợ khách hàng:</strong><br />
                        <Link to="mailto:cskh@phela.vn" className="underline text-sm">cskh@phela.vn</Link>
                    </p>
                    <p className="mt-2 text-sm">
                        <strong>Hotline hỗ trợ khách hàng:</strong><br />
                        1900 3013 (8h30 - 22h)
                    </p>
                </div>

                {/* Newsletter Subscription */}
                <div className="footer-section">
                    <h3 className="text-lg font-semibold mb-4">Nhận thông tin từ Phê La</h3>
                    {/* Social Media Icons */}
                    <div className='m-0 mx-auto'>
                        <div className="flex space-x-4 my-6">
                            <Link to="https://www.facebook.com/phelaxinchao" className="text-2xl">
                                <FaFacebook />
                            </Link>
                            <Link to="https://www.instagram.com/phela_xinchao" className="text-2xl">
                                <FaInstagram />
                            </Link>
                            <Link to="https://www.youtube.com/@phelaxinchao" className="text-2xl">
                                <TbBrandYoutube />
                            </Link>
                            <Link to="https://www.youtube.com/@phelaxinchao" className="text-2xl">
                                <PiTiktokLogo />
                            </Link>
                        </div>
                    </div>

                    <p className="text-sm mb-4">
                        Xin vui lòng để lại địa chỉ email, chúng tôi sẽ cập nhật những tin tức mới nhất của Phê La
                    </p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn..."
                            className="w-full p-2 rounded-full bg-white text-black focus:outline-none"
                        />
                        <button className="bg-white text-black px-4 py-2 rounded-full hover:bg-blue-300 ">Gửi</button>
                    </div>


                </div>
            </div>

            {/* Copyright */}
            <div className="text-center text-sm mt-8 border-t-2 border-white py-2">
                ©2020 bản quyền này thuộc về Công Ty Cổ Phần Phê La
            </div>
        </footer>
    );
};

export default Footer;