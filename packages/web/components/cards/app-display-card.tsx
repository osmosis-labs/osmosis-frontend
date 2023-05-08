import React from "react";

interface AppDisplayCardProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  externalUrl?: string;
}

const AppDisplayCard: React.FC<AppDisplayCardProps> = ({
  title,
  subtitle,
  imageUrl,
  twitterUrl,
  githubUrl,
  externalUrl,
}) => {
  return (
    <>
      <style jsx>{`
        .app-display-card:hover .card-image {
          @apply scale-115 transform transition-all duration-300 ease-in;
        }
        .app-display-card {
          @apply overflow-hidden;
        }
      `}</style>
      <a href={externalUrl} target="_blank" rel="noopener noreferrer">
        <div className="app-display-card bg-white overflow-hidden rounded-lg rounded-lg bg-osmoverse-800 shadow-md">
          <div
            className="card-image h-40 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          ></div>
          <div className="p-4">
            <div className="flex items-center">
              <h6 className="font-semibold">{title}</h6>
              <div className="ml-auto">
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                  <i className="color-osmoverse-400 fab fa-twitter text-xl"></i>
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="color-osmoverse-400 ml-2"
                >
                  <i className="color-osmoverse-400  fab fa-github text-xl"></i>
                </a>
              </div>
            </div>
            <p className="body2 text-osmoverse-200">{subtitle}</p>
          </div>
        </div>
      </a>
    </>
  );
};

export default AppDisplayCard;
