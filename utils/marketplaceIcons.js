// /utils/marketplaceIcons.js
import TokopediaIcon from "@/components/icons/TokopediaIcon";
import ShopeeIcon from "@/components/icons/ShopeeIcon";
import LazadaIcon from "@/components/icons/LazadaIcon";
import ZaloraIcon from "@/components/icons/ZaloraIcon";

export const marketplaceIcons = {
  tokopedia: TokopediaIcon,
  shopee: ShopeeIcon,
  lazada: LazadaIcon,
  zalora: ZaloraIcon,
};

export const getMarketplaceIcon = (name) => {
  const Icon = marketplaceIcons[name?.toLowerCase()];
  return Icon || null;
};