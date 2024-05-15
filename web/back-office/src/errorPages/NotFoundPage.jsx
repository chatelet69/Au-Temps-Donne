import "../css/errors.css";

const NotFoundPage = () => {
	document.body.className = "not-found-body";
	return (
		<div className="NotFound-Page">
			<h1>Error 404, Page Not Found</h1>
			<a href="/">Go to Dashboard</a>
		</div>
	);
}

export default NotFoundPage;