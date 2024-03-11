import { useState } from "react";
import { CircularProgress, Backdrop, Button } from "@mui/material";
import { IProduct } from "../interfaces/IProduct";
import { fetchAPI } from "../api";
import styles from "./ProductList.module.scss";
import {
  useGetProducts,
  filterProducts,
  removeDuplicate,
} from "./ProductList.utils";

const ProductList = () => {
  const [productsData, setProducts] = useState<IProduct[] | []>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productNameFilter, setProductNameFilter] = useState<string>("");
  const [minPriceFilter, setMinPriceFilter] = useState<number | undefined>();
  const [brandFilter, setBrandFilter] = useState<string>("");
  const { products, loading } = useGetProducts(
    productsData,
    setProducts,
    isLoading,
    setIsLoading
  );
  const itemsPerPage = 50;

  const getCurrentPageProducts = (): IProduct[] => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, products.length);
    return products.slice(startIndex - 1, endIndex);
  };

  const goToPreviousPage = (): void => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = (): void => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleFilter = async () => {
    setIsLoading(true);
    try {
      let filteredProductsIds: string[] = [];

      const filterRequests = [];
      if (productNameFilter) {
        filterRequests.push(filterProducts({ productName: productNameFilter }));
      }

      if (minPriceFilter !== undefined) {
        filterRequests.push(filterProducts({ minPrice: minPriceFilter }));
      }
      
      if (brandFilter) {
        filterRequests.push(filterProducts({ brand: brandFilter }));
      }

      for (const request of filterRequests) {
        const response = await request;
        filteredProductsIds = filteredProductsIds.concat(response);
      }

      const uniqueProductsIds = removeDuplicate(filteredProductsIds);

      const filteredProducts = await fetchAPI("get_items", {
        ids: uniqueProductsIds,
      });

      setIsLoading(false);
      setProducts(filteredProducts.result);
    } catch (error) {
      console.error("Error filtering products:", error);
      if (error instanceof Error) {
        console.error("Error ID:", error.message);
      }
      setTimeout(handleFilter, 3000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Backdrop
        open={loading}
        style={{
          zIndex: 1,
          color: "#fff",
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div style={{ visibility: loading ? "hidden" : "visible" }}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.pageTitle}>Product List</h1>
        </div>
        <div className={styles.filterSection}>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="Enter product name"
            value={productNameFilter}
            onChange={(e) => setProductNameFilter(e.target.value)}
          />
          <input
            className={styles.filterInput}
            type="number"
            placeholder="Enter min price"
            value={minPriceFilter ?? ""}
            onChange={(e) =>
              setMinPriceFilter(
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
          />
          <input
            className={styles.filterInput}
            type="text"
            placeholder="Enter brand"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          />
          <Button
            variant="contained"
            className={styles.filterButton}
            onClick={handleFilter}
          >
            Filter
          </Button>
        </div>
        <div className={styles.list}>
          {getCurrentPageProducts().map((product) => (
            <div className={styles.listItem} key={product.id}>
              <div className={styles.itemTitle}>
                ID: <p className={styles.itemText}>{product.id}</p>{" "}
              </div>
              <div className={styles.itemTitle}>
                {" "}
                Name:
                <p className={styles.itemText}> {product.product}</p>
              </div>
              <div className={styles.itemTitle}>
                Price: <p className={styles.itemText}>{product.price}</p>
              </div>
              <div className={styles.itemTitle}>
                Brand:
                <p className={styles.itemText}>
                  {" "}
                  {product.brand ?? "Неизвестный бренд"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            className={styles.button}
            variant="contained"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            className={styles.button}
            variant="contained"
            onClick={goToNextPage}
            disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
