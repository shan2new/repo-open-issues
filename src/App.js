import React from "react";
import { useState, useEffect } from "react";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Loader from "react-loader-spinner";
import GitHubMark from "./images/github_mark_light-lg.png";
import url from "url";
import { Motion, spring } from "react-motion";
import "./App.css";

const App = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [errorText, setErrorText] = useState("");
  const [issueInfo, setIssuesInfo] = useState({
    total: 0,
    firstSeg: 0,
    secondSeg: 0,
    thirdSeg: 0
  });
  const [foundResult, setFoundResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentPageNumber, setRecentPageNumber] = useState(0);

  const [totalIssuesCount, setTotalIssuesCount] = useState(0);
  const [totalPRCount, setTotalPRCount] = useState(0);
  const [lastPageNumber, setLastPageNumber] = useState(-1);

  useEffect(() => {});
  const validateUrl = url => {
    let acceptedProtocols = { "https:": true, "http:": true };
    return (
      url.protocol &&
      url.protocol in acceptedProtocols &&
      url.host &&
      url.host === "github.com" &&
      url.path &&
      url.path.split("/").length === 3
    );
  };

  const fetchTotalIssuesCount = repoPath => {
    let totalUrl = "https://api.github.com/repos" + repoPath;
    fetch(totalUrl, {
      headers: {
        Authorization: "token 6bca89b92fdf93b613b15284b6632a4f887ca3c7"
      }
    })
      .then(res => {
        return res.json();
      })
      .then(repoDetails => {
        setTotalIssuesCount(repoDetails.open_issues_count);
        console.log(repoDetails.open_issues_count);
      });
  };

  const fetchPullRequestCount = repoPath => {
    let totalUrl =
      "https://api.github.com/repos" +
      repoPath +
      "/pulls?state=open&page=1" +
      "&per_page=100";
    fetch(totalUrl, {
      headers: {
        Authorization: "token 6bca89b92fdf93b613b15284b6632a4f887ca3c7"
      }
    })
      .then(res => {
        let headers = res.headers;
        //possibility of no link
        headers.forEach((value, key) => {
          if (key === "link") {
            value = value
              .split(",")[1]
              .split(";")[0]
              .trim()
              .slice(0, -1)
              .slice(1);
            let lastPageUrl = url.parse(value);
            let lastPageNumberTemp = lastPageUrl.search
              .slice(1)
              .split("&")[2]
              .split("=")[1];
            console.log(lastPageNumberTemp);
            if (lastPageNumberTemp >= 1) setLastPageNumber(lastPageNumberTemp);
          }
        });
        return res.json();
      })
      .then(pullRequests => {
        if (lastPageNumber) {
          totalUrl =
            "https://api.github.com/repos" +
            repoPath +
            "/pulls?state=open&page=1" +
            "&per_page=" +
            lastPageNumber;
          fetch(totalUrl, {
            headers: {
              Authorization: "token 6bca89b92fdf93b613b15284b6632a4f887ca3c7"
            }
          })
            .then(res => {
              return res.json();
            })
            .then(lastPageItems => {
              if (lastPageItems && lastPageItems.length) {
                console.log(lastPageItems, lastPageItems.length);
                debugger;
                setTotalPRCount(lastPageItems.length + 100 * lastPageNumber);
                console.log(lastPageItems.length + 100 * lastPageNumber);
              }
            });
        }
        console.log("Got the Pull Requests");
      });
  };

  const fetchIssues = pageNumber => {
    if (error) {
      return;
    }
    if (!pageNumber || typeof pageNumber !== "number") {
      pageNumber = 1;
    }
    if (pageNumber <= recentPageNumber) {
      return;
    }
    setRecentPageNumber(recentPageNumber);
    if (repoPath) {
      let totalUrl =
        "https://api.github.com/repos" +
        repoPath +
        "/issues?state=open&page=" +
        pageNumber +
        "&per_page=100";
      setLoading(true);
      fetch(totalUrl, {
        headers: {
          Authorization: "token 6bca89b92fdf93b613b15284b6632a4f887ca3c7"
        }
      })
        .then(res => {
          return res.json();
        })
        .then(issues => {
          fetchTotalIssuesCount(repoPath);
          fetchPullRequestCount(repoPath);
          if (issues && issues.length) {
            issues = issues.filter(function(val) {
              if (val["pull_request"]) {
                return false;
              }
              return true;
            });
            issueInfo.total += issues.length;
            setIssuesInfo(issueInfo);
          }

          if (issues && issues.length === 0) {
            setFoundResult(true);
            setLoading(false);
          } else {
            fetchIssues(pageNumber + 1);
          }
        });
    } else {
      setError(true);
      setErrorText("The input field cannot be left empty!");
    }
  };
  const handleKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      setFoundResult(false);
      setIssuesInfo({});
      fetchIssues(1);
    }
  };
  const handleChange = event => {
    let inputUrl = event.target.value.trim();
    if (!inputUrl) {
      setRepoUrl(inputUrl);
      setErrorText("");
      setError(false);
      return;
    }
    let parsedUrl = url.parse(inputUrl);
    if (!validateUrl(parsedUrl)) {
      setRepoPath("");
      setError(true);
      setErrorText("Invalid URL! Please check & try again!");
    } else {
      setRepoPath(parsedUrl.pathname);
      setError(false);
    }
    setRepoUrl(inputUrl);
  };
  const config = { stiffness: 140, damping: 14 };
  const toCSS = scale => ({
    transform: `scale3d(${scale}, ${scale}, ${scale})`
  });
  const centerAlign = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  };
  if (loading) {
    return (
      <div style={centerAlign}>
        <Loader type="Puff" color="#00BFFF" height="500" width="500" />
      </div>
    );
  } else
    return (
      <Container className="mt-5 h-100">
        <Row className="mb-5">
          <Col className="justify-content-center d-flex">
            <Row className="justify-content-center align-items-center">
              <Col xs={12} md={3}>
                <img src={GitHubMark} alt="image_broken" />
              </Col>
              <Col>
                <h2 style={{ color: "#ffffff", fontWeight: 800 }}>
                  GitHub Issues Tracker
                </h2>
              </Col>
            </Row>
          </Col>
        </Row>
        <Form>
          <Row>
            <Col>
              <InputGroup className="mb-3">
                <FormControl
                  id="basic-url"
                  aria-describedby="basic-addon3"
                  placeholder="example: https://github.com/facebook/react"
                  onKeyPress={handleKeyPress}
                  value={repoUrl}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
          </Row>
          {error ? (
            <Motion
              defaultStyle={{ scale: 0 }}
              style={{ scale: spring(1, config) }}
            >
              {value => (
                <div className="box" style={toCSS(value.scale)}>
                  <Row>
                    <Col>
                      <Form.Text className="text-light">{errorText}</Form.Text>
                    </Col>
                  </Row>
                </div>
              )}
            </Motion>
          ) : null}
          <Row>
            <Col className="justify-content-center d-flex" xs={12}>
              <Button
                onClick={fetchIssues}
                className="text-uppercase"
                style={{ fontWeight: 600 }}
              >
                Fetch Issues Information
              </Button>
            </Col>
          </Row>
        </Form>
        {foundResult ? (
          <Row className="mt-5">
            <Col>
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr>
                    <th align="center">Total</th>
                    <th align="center">Less Than 24 Hours</th>
                    <th align="center">Between 1 to 7 days</th>
                    <th align="center">More than 7 days</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td align="center">{issueInfo.total}</td>
                    <td align="center">2</td>
                    <td align="center">1</td>
                    <td align="center">1</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        ) : null}
      </Container>
    );
};

export default App;
