import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Inventory2TwoToneIcon from "@mui/icons-material/Inventory2TwoTone";
import ReceiptLongTwoToneIcon from "@mui/icons-material/ReceiptLongTwoTone";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StorefrontTwoToneIcon from "@mui/icons-material/StorefrontTwoTone";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ProductionQuantityLimitsOutlinedIcon from "@mui/icons-material/ProductionQuantityLimitsOutlined"; // This is for when a timer on the cart is going to run out
import ShoppingCartTwoToneIcon from "@mui/icons-material/ShoppingCartTwoTone";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import PersonIcon from "@mui/icons-material/Person";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import { useIsMobileScreen } from "../hooks/useIsMobileScreen";
import MailIcon from "@mui/icons-material/Mail";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import React, { useEffect, useState } from "react";

// IMPORTANT
// Navbar still needs to adjust for smaller screens
// possible solution to scale the whole navbar
// issue occurs at 440px or less
// IMPORTANT

export default function Navbar() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const [categories, setCategories] = useState([]);
  const [userToken, setUserToken] = useState(null);
  const [shoppingCart, setShoppingCart] = useState();
  const [shoppingCartPriceTotal, setShoppingCartPriceTotal] = useState();
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // store shopping cart id in local storage for data preseverance,
  // create one if not already assigned
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const getShoppingCart = async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        signal,
      };
      // if exists try and get cart, or create new one if cart no longer exists
      if (localStorage.getItem("shoppingCartId")) {
        try {
          const cartId = localStorage.getItem("shoppingCartId");
          const cart = (await axios.get(`/api/cart/${cartId}`, config)).data[0];
          // if cart is length 0 then the cart either doesn't exist anymore or is empty either way safe to recreate
          if (cart?.products_selected?.length === 0) {
            await axios.delete(`/api/cart/${cartId}`);
            const shoppingCartId = (await axios.post("/api/cart/", config)).data
              .data._id;
            localStorage.setItem("shoppingCartId", shoppingCartId);
            const cart = (
              await axios.get(`/api/cart/${shoppingCartId}`, config)
            ).data[0];
            setShoppingCart(cart);
            setCartLoaded(true);
          }
          // Cart has items still that haven't been erased in timeout so set the cart equal to this
          else {
            setShoppingCart(cart);
            setCartLoaded(true);
          }
        } catch (error) {
          // error has occured
          return error;
        }
      }
      // if shopping cart doesn't exist then create one
      else {
        try {
          const shoppingCartId = (await axios.post("/api/cart/", config)).data
            .data._id;
          localStorage.setItem("shoppingCartId", shoppingCartId);
          const cart = (await axios.get(`/api/cart/${shoppingCartId}`, config))
            .data[0];
          setShoppingCart(cart);
          setCartLoaded(true);
        } catch (error) {
          return error;
        }
      }
    };
    getShoppingCart();
    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    if (cartLoaded) {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        signal,
      };
      const setProductInfo = async (productID) => {
        try {
          const res = await axios.get("/api/product/" + productID, config);
          setSelectedItems((prev) => [...prev, res.data[0]]);
        } catch (error) {
          return;
        }
      };
      const loopThroughCart = () => {
        shoppingCart?.products_selected?.forEach((product) => {
          setProductInfo(product.product_id);
        });
      };
      if (shoppingCart?.products_selected?.length > 0) {
        loopThroughCart();
      }
    }
    return () => {
      controller.abort();
    };
  }, [cartLoaded, shoppingCart]);

  useEffect(() => {
    if (shoppingCart) {
      let total = 0;
      shoppingCart?.products_selected?.forEach((product) => {
        total += product.product_price * product.quantity;
      });
      setShoppingCartPriceTotal(total.toFixed(2));
    }
  }, [shoppingCart]);

  useEffect(() => {
    function handleLoggedInStatus() {
      setUserToken(localStorage.getItem("authToken"));
    }
    handleLoggedInStatus();
  });

  // Get Categories Data
  useEffect(() => {
    const controller = new AbortController();
    let unmounted = false;

    (async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      };
      await axios
        .get("/api/category", config)
        .then((response) => {
          if (!unmounted) {
            setCategories(response.data);
            controller.abort();
          }
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            return "axios request cancelled...";
          }
          return error;
        });
    })();

    return () => {
      unmounted = true;
      controller.abort();
    };
  }, []);

  // Category Selection Click Handler
  const handleSelectCategory = (categoryId) => {
    navigate(`search/category/${categoryId}`);
  };

  // Shopping dropdown
  const [anchorShopping, setAnchorShopping] = useState(null);
  const openShopping = Boolean(anchorShopping);
  const handleShoppingClick = (event) => {
    setAnchorShopping(event.currentTarget);
  };
  const handleShoppingClose = () => {
    setAnchorShopping(null);
  };

  // Category dropdown
  const [anchorCategory, setAnchorCategory] = useState(null);
  const openCategory = Boolean(anchorCategory);
  const handleCategoryClick = (event) => {
    setAnchorCategory(event.currentTarget);
  };
  const handleCategoryClose = () => {
    setAnchorCategory(null);
  };

  // Acounts dropdown
  const [anchorAcc, setAnchorAcc] = useState(null);
  const openAcc = Boolean(anchorAcc);
  const handleAccClick = (event) => {
    setAnchorAcc(event.currentTarget);
  };
  const handleAccClose = () => {
    setAnchorAcc(null);
  };

  // handle logout
  const HandleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // this will adjust the screen size accordinly
  const windowSize = useIsMobileScreen(700);

  // navigate to click handler functions
  const navigate = useNavigate();
  const navigateToAccount = () => {
    navigate("/account");
  };
  const navigateToRegister = () => {
    navigate("/register");
  };
  const navigateToLogin = () => {
    navigate("/login");
  };

  const navigateToMyStalls = () => {
    navigate("/account/stalls/mystalls");
  };

  const navigateToMessages = () => {
    navigate("/account/messages");
  };

  const navigateToOrdersRecieved = () => {
    navigate("/account/orders/received");
  };

  const navigateToMyOrders = () => {
    navigate("/account/orders/myorders");
  };

  const navigateToMyProducts = () => {
    navigate("/account/products/myproducts");
  };

  const [searchError, setSearchError] = useState("");
  const [openSearchError, setOpenSearchError] = useState(false);

  const handleSearchErrorClose = () => {
    setOpenSearchError(false);
  };

  const ErrorAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  // Search submit
  const onSearchSubmit = async (e) => {
    if (e.key === "Enter") {
      if (searchQuery.trim().length < 2) {
        setSearchError("Search term must be at least 2 characters");
        setOpenSearchError(true);
        return setSearchQuery(searchQuery.trim());
      }

      navigate(`/search/results/?q=${searchQuery.trim()}`);
    }
  };

  // Handle cart clear
  const handleCartClear = async () => {
    try {
      console.log("clear cart");
      await axios.put("/api/cart/clearcart/" + shoppingCart._id);
      setCartLoaded(false);
      setShoppingCart();
      setShoppingCartPriceTotal();
      setSelectedItems([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* Top menu bar */}
      <Box
        sx={{
          width: "100%",
          minHeight: 60,
          maxHeight: 120,
          margin: 0,
          p: 0,
          pt: 1,
          pb: 0.5,
          bgcolor: "#03a9f4",
          position: "relative",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Snackbar
          open={openSearchError}
          autoHideDuration={6000}
          onClose={handleSearchErrorClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <ErrorAlert
            onClose={handleSearchErrorClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            {searchError}
          </ErrorAlert>
        </Snackbar>

        <Grid
          container
          direction={"row"}
          justifyContent="flex-end"
          alignContent={"center"}
          sx={{ margin: "auto", pr: "5%" }}
        >
          <Grid
            item
            justifyContent={"center"}
            alignContent={"center"}
            sx={{ margin: 0, p: 0 }}
          >
            <NavLink to="/">
              <Box
                component="img"
                src={PF + "Sunday Markets-logos_white.png"}
                sx={{
                  minHeight: 60,
                  maxHeight: 60,
                  marginLeft: 2,
                }}
              />
            </NavLink>
          </Grid>
          {/* Search bar desktop */}
          {!windowSize && (
            <Grid
              item
              alignContent={"center"}
              sx={{ margin: "auto", width: "35%" }}
            >
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                sx={{ bgcolor: "#eceff1" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onSearchSubmit}
              />
            </Grid>
          )}
          {/* Icon menu */}
          {/* Categories */}
          <Grid
            item
            justifyContent={"center"}
            alignContent={"center"}
            sx={{ margin: "auto", marginRight: "1%" }}
          >
            <IconButton
              sx={{ pl: 3 }}
              onClick={handleCategoryClick}
              aria-controls={openCategory ? "category-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openCategory ? "true" : undefined}
            >
              <FilterAltRoundedIcon
                sx={{
                  transform: "scale(2)",
                  color: "#eceff1",
                  margin: "auto",
                }}
              />
            </IconButton>
            <Typography
              sx={{ fontSize: "12px", color: "white", pl: 1.5, margin: "auto" }}
            >
              Categories
            </Typography>
          </Grid>
          {/* Account */}
          <Grid
            item
            justifyContent={"center"}
            alignContent={"center"}
            sx={{ margin: "auto", marginLeft: "1%", marginRight: "3%" }}
          >
            <IconButton
              sx={{ pl: 3 }}
              onClick={handleAccClick}
              aria-controls={openAcc ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openAcc ? "true" : undefined}
            >
              <AccountCircleRoundedIcon
                sx={{
                  transform: "scale(2)",
                  color: "white",
                  margin: "auto",
                }}
              />
            </IconButton>
            <Typography
              sx={{ fontSize: "12px", color: "white", pl: 1.5, margin: "auto" }}
            >
              Account
            </Typography>
          </Grid>

          {/* Help Icon  */}
          <Grid item p={1} justifyContent="center" alignItems="center">
            <HelpOutlineIcon
              style={{ fontSize: 55, color: "white" }}
              onClick={() => navigate("/support")}
            />
            <Typography variant="body2" color="white">
              Support
            </Typography>
          </Grid>

          {/* Shopping Cart */}
          <Grid
            item
            justifyContent={"center"}
            alignContent={"center"}
            sx={{
              margin: 0,
              bgcolor: "#0288d1",
              borderRadius: 2,
              maxHeight: 60,
            }}
          >
            <IconButton
              sx={{ margin: 1 }}
              onClick={handleShoppingClick}
              aria-controls={openAcc ? "shopping-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openAcc ? "true" : undefined}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  color: "white",
                  pr: 3.5,
                  margin: 0,
                }}
              >
                ${shoppingCartPriceTotal ? shoppingCartPriceTotal : "00.00"}
              </Typography>
              <ShoppingCartTwoToneIcon
                sx={{
                  transform: "scale(1.6)",
                  color: "#eceff1",
                  margin: "auto",
                }}
              />
            </IconButton>
          </Grid>
          <Box width={"100%"} />
          {windowSize && (
            <Grid
              item
              alignContent={"center"}
              sx={{
                margin: "auto",
                width: "100%",
                marginLeft: 2,
                marginRight: 0,
                pt: 1,
                pb: 1,
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                sx={{ bgcolor: "#eceff1" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              ></TextField>
            </Grid>
          )}
        </Grid>
      </Box>
      {/* Bottom menu bar */}
      <Box
        sx={{
          width: "100%",
          minHeight: 40,
          maxHeight: 60,
          bgcolor: "#0288d1",
        }}
      />
      {/* Account menu */}
      {userToken ? (
        <Menu
          anchorEl={anchorAcc}
          id="account-menu"
          open={openAcc}
          onClose={handleAccClose}
          onClick={handleAccClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: "#03a9f4",
              boxShadow: 5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "#03a9f4",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem sx={{ color: "white" }} onClick={navigateToAccount}>
            <PersonIcon sx={{ pr: 1.5, scale: 2, margin: 0 }} />
            My Account
          </MenuItem>
          <MenuItem sx={{ color: "white" }} onClick={navigateToMessages}>
            <MailIcon sx={{ pr: 1.5 }} />
            Messages
          </MenuItem>
          <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />
          <MenuItem sx={{ color: "white" }} onClick={navigateToOrdersRecieved}>
            <ReceiptIcon sx={{ pr: 1.5 }} />
            Orders Recieved
          </MenuItem>
          <MenuItem sx={{ color: "white" }} onClick={navigateToMyOrders}>
            <ReceiptLongTwoToneIcon sx={{ pr: 1.5 }} />
            My Orders
          </MenuItem>
          <MenuItem sx={{ color: "white" }} onClick={navigateToMyStalls}>
            <StorefrontTwoToneIcon sx={{ pr: 1.5 }} />
            My Stalls
          </MenuItem>
          <MenuItem sx={{ color: "white" }} onClick={navigateToMyProducts}>
            <Inventory2TwoToneIcon sx={{ pr: 1.5 }} />
            My Products
          </MenuItem>
          <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />
          <MenuItem sx={{ color: "white" }} onClick={HandleLogout}>
            <LogoutRoundedIcon sx={{ pr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>
      ) : (
        <Menu
          anchorEl={anchorAcc}
          id="account-menu"
          open={openAcc}
          onClose={handleAccClose}
          onClick={handleAccClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: "#03a9f4",
              boxShadow: 5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "#03a9f4",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem sx={{ color: "white" }} onClick={navigateToRegister}>
            <PersonIcon sx={{ pr: 1.5, scale: 2 }} />
            Sign Up
          </MenuItem>
          <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />
          <MenuItem sx={{ color: "white" }} onClick={navigateToLogin}>
            <LoginRoundedIcon sx={{ pr: 1.5 }} />
            Login
          </MenuItem>
        </Menu>
      )}
      <Menu
        anchorEl={anchorCategory}
        id="category-menu"
        open={openCategory}
        onClose={handleCategoryClose}
        onClick={handleCategoryClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            bgcolor: "#03a9f4",
            boxShadow: 5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "#03a9f4",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Categories Menu */}
        {categories.map((category) => (
          <MenuItem
            sx={{ color: "white", px: 4 }}
            key={category._id}
            onClick={() => handleSelectCategory(category._id)}
          >
            {category.category_name}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={anchorShopping}
        id="shopping-menu"
        open={openShopping}
        onClose={handleShoppingClose}
        onClick={handleShoppingClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            bgcolor: "#03a9f4",
            boxShadow: 5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "#03a9f4",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {selectedItems !== [] &&
          selectedItems.length === shoppingCart?.products_selected?.length &&
          shoppingCart?.products_selected?.map((product, index) => (
            <Box
              container
              direction={"row"}
              justifyContent="center"
              alignContent={"center"}
              width={"100%"}
              key={index}
            >
              <MenuItem sx={{ color: "white" }} width={"100%"}>
                <Box
                  component={"img"}
                  sx={{ maxHeight: 60, maxWidth: 80 }}
                  alt={"This product image of the shopping cart"}
                  src={`${PF}products/${selectedItems[index].image}`}
                />
                <Typography paddingLeft={2} sx={{ width: "100%" }}>
                  {product.product_name
                    ? product.product_name
                    : "No name for this poduct can be found"}
                </Typography>
                <Typography paddingLeft={2}>QTY {product.quantity}</Typography>
                <Typography paddingLeft={2}>
                  ${(product.quantity * product.product_price).toFixed(2)}
                </Typography>
              </MenuItem>
            </Box>
          ))}
        <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />

        <Typography>
          Estimated Total: $
          {shoppingCartPriceTotal ? shoppingCartPriceTotal : "00.00"}
        </Typography>
        <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />
        <Box
          container
          direction={"row"}
          justifyContent="center"
          alignContent={"center"}
          sx={{
            width: "100%",
          }}
        >
          <Typography
            sx={{
              color: "white",
              margin: "auto",
              textAlign: "center",
            }}
          >
            Time Remaining:
          </Typography>
          <Box
            justifyContent="center"
            alignContent={"center"}
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <IconButton sx={{ margin: "auto", marginRight: 0 }}>
              <RefreshRoundedIcon />
            </IconButton>
            <Typography
              sx={{
                pl: 1,
                color: "white",
                margin: "auto",
                marginLeft: 0,
              }}
            >
              00.00.00s
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: "white", width: "80%", margin: "auto" }} />
        <Box
          justifyContent="center"
          alignContent={"center"}
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              margin: 2,
              marginBottom: 0.5,
              border: 1,
              boxShadow: 2,
            }}
            onClick={handleCartClear}
          >
            Clear
          </Button>
          <Box width={"10%"} />
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              margin: 2,
              marginBottom: 0.5,
              border: 0,
              boxShadow: 2,
            }}
            onClick={() => navigate("/shoppingcart/myshoppingcart")}
          >
            View Cart
          </Button>
        </Box>
      </Menu>
      {/* <Outlet /> */}
    </>
  );
}
