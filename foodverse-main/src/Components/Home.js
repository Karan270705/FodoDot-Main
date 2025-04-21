import React from "react";
import Recipe from "./Recipe";
import ChatBot from "./Chat/ChatBot";
// import FryingPan from "./FryingPan";

const Home = ({ recipes, loading, error }) => {
  if (loading) {
    return (
      <div className="container mx-auto py-8 flex flex-wrap gap-10 justify-center items-center">
        <div className="text-center">
          <div className="text-3xl text-purple-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 flex flex-wrap gap-10 justify-center items-center">
        <div className="text-center">
          <div className="text-3xl text-red-600">
            {error}. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 flex flex-wrap gap-10 justify-center items-center">
        {recipes?.length > 0 ? (
          recipes.map((recipe) => <Recipe key={recipe.id} recipe={recipe} />)
        ) : (
          <div className="text-center">
            <div className="text-3xl text-purple-600">
              Nothing to show. Search for a recipe!
            </div>
          </div>
        )}
      </div>
      <ChatBot />
    </>
  );
};

export default Home;
