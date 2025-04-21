import { NavLink } from "react-router-dom";
const Navbar = ({
  searchHandler,
  inputField,
  searchQuery,
  setSearchQuery,
  savedItems,
}) => {
  const navActive = ({ isActive }) => {
    return {
      color: isActive ? "#8e24aa" : null,
    };
  };

  return (
    <div className="navbar flex justify-between items-center container mx-auto py-8 flex-col lg:flex-row gap-5 lg:gap-0">
      <h2 className="logo text-2xl font-bold lowercase italic">
        Fodo<span className="text-purple-500">DOT</span>
      </h2>
      <form className="search-bar" onSubmit={searchHandler}>
        <input
          ref={inputField}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="search"
          placeholder="Search recipe...."
          required
          className="bg-white/75 p-3 px-8 lg:w-96 rounded-full outline-none shadow-lg shadow-red-100 focus:shadow-red-200 duration-300"
        />
      </form>
      <ul className="menu flex gap-5">
        <li>
          <NavLink
            style={navActive}
            end
            to="/"
            className="text-purple-400 hover:text-purple-600 duration-300"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            style={navActive}
            to="/Favourites"
            className="text-gray-400 hover:text-purple-600 duration-300"
          >
            Favourites
            <span className="favourites-count font-bold text-sky-400">
              ({savedItems.length})
            </span>
          </NavLink>  
        <li>
          <NavLink
            style={navActive}
            end
            to="/login"
            className="text-gray-400 hover:text-purple-600 duration-300"
          >
            Login
          </NavLink>
        </li>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
