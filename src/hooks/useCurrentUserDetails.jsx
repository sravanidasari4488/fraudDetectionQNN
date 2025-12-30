import { useAuth } from "../context/AuthProvider";
function useCurrentUserDetails() {
  const { user, setUser, isLoggedIn, refreshUserDetails } = useAuth();
  const changeUserDetails = (
    user = { user },
    isLoggedIn = { isLoggedIn }
  ) => {};

  return {
    name: user ? user.name : "",
    email: user ? user.email : "",
    userAddress: user ? user.address : "",
    phone: user ? user.phone : "",
    profileImage: user ? user.profileImage : "",
    _id: user ? user._id : "",
    reviews: user ? user.reviews : [],
    ratings: user ? user.ratings : 0,
    userId: user ? user._id : "",
    service: user ? user.service : "",
    isLoggedIn,
    authToken: user ? user.authToken : "",
    refreshToken: user ? user.refreshToken : "",
    refreshUserDetails,
    setUser,
  };
}

export default useCurrentUserDetails;
