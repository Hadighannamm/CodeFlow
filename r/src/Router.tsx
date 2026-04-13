import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./websitePages/HomePage";
import AskQuestionPage from "./websitePages/AskQuestionPage";
import QuestionDetailsPage from "./websitePages/QuestionDetailsPage";
import EditQuestionPage from "./websitePages/EditQuestionPage";
import AuthPage from "./websitePages/AuthPage";
import ExplorePage from "./websitePages/ExplorePage";
import TagsPage from "./websitePages/TagsPage";
import TagDetailsPage from "./websitePages/TagDetailsPage";
import ProfilePage from "./websitePages/ProfilePage";
import FavouritesPage from "./websitePages/FavouritesPage";
import NotFoundPage from "./websitePages/NotFoundPage";
import ErrorPage from "./websitePages/ErrorPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "ask", element: <AskQuestionPage /> },
            { path: "question/:id", element: <QuestionDetailsPage /> },
            { path: "question/:id/edit", element: <EditQuestionPage /> },
            { path: "explore", element: <ExplorePage /> },
            { path: "tags", element: <TagsPage /> },
            { path: "tags/:tag", element: <TagDetailsPage /> },
            { path: "profile", element: <ProfilePage /> },
            { path: "favourites", element: <FavouritesPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
    {
        path: "/auth",
        element: <AuthPage />,
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}