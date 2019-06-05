import React, { useState, useEffect } from "react";
import url from "url";

import UrlBarUI from "../components/UrlBar";

const UrlBar = props => {
  const [inputURL, setInputURL] = useState("");
  const [inputPath, setInputPath] = useState("");
  const [errorText, setErrorText] = useState("");
  const [error, setError] = useState(false);

  const validateUrl = url => {
    let acceptedProtocols = { "https:": true, "http:": true };
    if (url.path) {
      console.log(url.pathname.split("/"));
    }
    return (
      (!url.protocol || (url.protocol && url.protocol in acceptedProtocols)) &&
      url.host &&
      (url.host === "github.com" || url.host === "www.github.com") &&
      url.pathname &&
      url.pathname.split("/").length >= 3 &&
      url.pathname.split("/")[1] !== "" &&
      url.pathname.split("/")[2] !== ""
    );
  };

  const handleChange = event => {
    let rawUrl = event.target.value.trim();
    if (!rawUrl) {
      setInputURL(rawUrl);
      setErrorText("");
      setError(false);
      return;
    }
    let parsedUrl = url.parse(rawUrl);

    if (!validateUrl(parsedUrl)) {
      setInputPath("");
      setError(true);
      setErrorText("Not a GitHub Repo URL. Please check and try again!");
    } else {
      setInputPath(parsedUrl.pathname);
      setError(false);
    }
    setInputURL(rawUrl);
  };

  const handleKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!inputPath) {
        return;
      }
      props.triggerEvent(inputPath);
    }
  };

  const handleButtonClick = () => {
    if (!inputPath) {
      return;
    }
    props.triggerEvent(inputPath);
  };

  useEffect(() => {
    console.log(error, props.resultError);
  });

  return (
    <UrlBarUI
      validateUrl={validateUrl}
      handleChange={handleChange}
      handleKeyPress={handleKeyPress}
      handleButtonClick={handleButtonClick}
      inputURL={inputURL}
      error={error || props.resultError}
      errorText={props.resultError !== "" ? props.resultError : errorText}
    />
  );
};

export default UrlBar;
