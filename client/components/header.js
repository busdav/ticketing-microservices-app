import Link from "next/link";

export default ({ currentUser }) => {
  // The below is a little trick so we don't need to have a lot of messy conditional jsx inside the return statement
  // The individual array entries are only truthy i.e. only exist if their condition is fulfilled. E.g.:
  // [false, false, { label: "Sign Out", href: "/auth/signout" }]
  const links = [
    !currentUser && { label: "Sign Up", href: "/auth/signup" },
    !currentUser && { label: "Sign In", href: "/auth/signin" },
    currentUser && { label: "Sign Out", href: "/auth/signout" },
  ]
    // We're only going to keep those entries that are not falsy:
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }) => {
      return (
        <li key={href} className="nav-item">
          <Link href={href}>
            <a className="nav-link">{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        {/* We still have to put an anchor tag here - Next.js' `link` component alone does not create a hyperlink element automatically */}
        <a className="navbar-brand">GitTix</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
