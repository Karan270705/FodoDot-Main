const Footer = () => {
  return (
    <footer className="py-8 flex flex-col gap-3 items-center bg-purple-200 opacity-75">
      <h2 className="text-2xl font-bold lowercase italic">
        Fodo<span className="text-purple-500">DOT</span>
      </h2>
      <p>&copy; {new Date().getFullYear()} FodoDOT. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
