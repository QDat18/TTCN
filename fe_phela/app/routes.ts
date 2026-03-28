import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";
import { Children } from "react";

const customerRoutes: RouteConfig = [
    index("routes/CustomerDashboard.tsx"),

    // Sản phẩm
    route("san-pham", "routes/product.tsx"),
    route("san-pham/:productId", "routes/productDetail.tsx"),
    route("cart", "routes/cart.tsx"),
    route("payment", "routes/payment.tsx"),
    route("payment-return", "routes/paymentReturn.tsx"),

    // Câu chuyện thương hiệu
    route("ve-chung-toi", "routes/aboutUs.tsx"),
    route("phong-cach-khac-biet-tai-phe-la", "routes/differentStyle.tsx"),

    // Tin tức
    route("tin-tuc", "routes/news.tsx"),
    route("tin-tuc/:newsId", "routes/newDetail.tsx"),

    // Cửa hàng
    route("he-thong-cua-hang", "routes/storePage.tsx"),

    // Tuyển dụng
    route("tuyen-dung", "routes/recruitmentCus.tsx"),
    route("tuyen-dung/:recruitmentId", "routes/recruitmentDetail.tsx"),

    // Thẻ thành viên
    route("dieu-khoan-va-dieu-kien-su-dung-the-thanh-vien-phe-la", "routes/clause.tsx"),

    // Liên hệ
    route("lien-he", "routes/contact.tsx"),

    // Chuyện đặc sản
    route("chuyendacsan", "routes/specialtyStory.tsx"),

    //Tài khoản
    route("login-register", "routes/loginRegisterCus.tsx"),
    route("profileCustomer", "routes/profileCustomer.tsx"),
    route("my-address", "routes/deliveryAddress.tsx"),
    route("my-orders", "routes/myOrders.tsx"),
    route("my-orders/:orderId", "routes/orderDetail.tsx"),
    route("oauth2/callback", "routes/oauth2Callback.tsx"),
];

const adminRoutes: RouteConfig = [
      index("routes/loginRegisterAdmin.tsx"),
      route("dashboard", "routes/AdminDashboard.tsx"),
      route("san-pham", "routes/productManage.tsx"),
      route("danh-muc", "routes/category.tsx"),
      route("don-hang", "routes/orderManage.tsx"),
      route("don-hang/:orderId", "routes/orderDetailReport.tsx"),
      route("bao-cao-don-hang", "routes/orderReport.tsx"),
      route("doanh-thu", "routes/revenue.tsx"),
      route("chuong-trinh-khuyen-mai", "routes/promotions.tsx"),
      route("qua-tang", "routes/present.tsx"),
      route("ma-giam-gia", "routes/discountCode.tsx"),
      route("profileAdmin", "routes/profileAdmin.tsx"),
      route("staff", "routes/staff.tsx"),
      route("store", "routes/storeManage.tsx"),
      route("tin-tuyen-dung", "routes/recruitment.tsx"),
      route("tin-tuyen-dung/:jobPostingId/candidates", "routes/recruitmentDetailJob.tsx"),
      route("ung-vien", "routes/candidate.tsx"),
      route("banner", "routes/bannerManager.tsx"),
      route("tin-tuc-admin", "routes/newsManager.tsx"),
      route("tin-tuc-admin/:newsId", "routes/newsDetailManager.tsx"),
      route("support", "routes/support.tsx"),
];


export default [
  // Route cho giao diện admin
  {
    ...route("admin", "root.tsx"),
    children: adminRoutes,
    id: "admin-root"
  },

  // Route cho giao diện customer
  {
    ...route("/", "root.tsx"),
    children: customerRoutes,
    id: "customer-root"
  },
] satisfies RouteConfig;