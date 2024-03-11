import { useEffect, Dispatch, SetStateAction } from "react";
import { IProduct } from "../interfaces/IProduct";
import { fetchAPI } from "../api";

export const useGetProducts = (
  products: IProduct[] | [],
  setProducts: Dispatch<SetStateAction<IProduct[] | []>>,
  loading: boolean,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAPI("get_ids");
        const ids = response.result;
        const productsData = await fetchAPI("get_items", { ids });
        const uniqueProducts = removeDuplicateProducts(productsData.result);

        setProducts(uniqueProducts);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (error instanceof Error) {
          console.error("Error ID:", error.message);
        }
        setTimeout(fetchData, 3000);
      }
    };

    fetchData();
  }, [setProducts, setIsLoading]);

  return { products, loading };
};

export const removeDuplicateProducts = (products: IProduct[]): IProduct[] => {
  const uniqueProductsMap: Map<string, IProduct> = new Map();

  products.forEach((product) => {
    if (!uniqueProductsMap.has(product.id)) {
      uniqueProductsMap.set(product.id, product);
    }
  });

  return Array.from(uniqueProductsMap.values());
};

export const filterProducts = async (filters: {
  productName?: string;
  minPrice?: number;
  brand?: string;
}) => {
  try {
    const params: any = {};

    if (filters.productName) {
      params.product = filters.productName;
    }

    if (filters.minPrice !== undefined) {
      params.price = filters.minPrice;
    }

    if (filters.brand) {
      params.brand = filters.brand;
    }

    const response = await fetchAPI("filter", params);

    return response.result;
  } catch (error) {
    throw new Error("Failed to filter products");
  }
};

export const removeDuplicate = (arr: string[]) => {
  return arr.filter((item, index) => arr.indexOf(item) === index);
};
