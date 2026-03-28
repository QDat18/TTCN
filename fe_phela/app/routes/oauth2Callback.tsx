import OAuth2Callback from "~/pages/customer/account/OAuth2Callback";

export function meta() {
  return [
    { title: "Đang xác thực - Phê La" },
  ];
}

export default function OAuth2CallbackRoute() {
  return <OAuth2Callback />;
}
