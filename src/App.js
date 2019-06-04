import React from "react";
import moment from "moment";
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
import { parallel } from 'async';

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

  const fetchTotalIssuesCount = (callback) => {
    let totalUrl = "https://api.github.com/repos" + repoPath;
    return fetch(totalUrl, {
      headers: {
        Authorization: "token 5b74479959e6943672be005eed144377dfb957ad"
      }
    })
      .then(res => {
        return res.json();
      })
      .then(repoDetails => {
        setTotalIssuesCount(repoDetails.open_issues_count);
        console.log('Total Open Issues Count',repoDetails.open_issues_count);
        callback(null, {'success': true});
      });
  };

  const fetchPullRequestCount = (callback) => {
    let tempRepoPath = repoPath;
    if(repoPath[0] === '/') {
      tempRepoPath = repoPath.slice(1);
    }

    let totalUrl =
      "https://api.github.com/search/issues?q=repo:" +
      tempRepoPath + "+is:pr+is:open";
    return fetch(totalUrl, {
      headers: {
        Authorization: "token 5b74479959e6943672be005eed144377dfb957ad"
      }
    })
      .then(res => {
        return res.json();
      })
      .then(pullRequests => {
        console.log("Got the Pull Requests", pullRequests);
        callback(null, {'success': true});
      });
  };

  const fetchIssues = (days, callback) => {
    console.log('I came here');
    let date = null;
    if(!days || typeof days !== 'number') {
      days = 1;
    }

    date = moment(new Date()).subtract(days, "days").format("YYYY-MM-DD");
    if (error) {
      return;
    }

    if (repoPath) {
      let tempRepoPath = repoPath;
      if(repoPath[0] === '/') {
        tempRepoPath = repoPath.slice(1);
      }
      let totalUrl =
        "https://api.github.com/search/issues?q=repo:" +
        tempRepoPath  +
        "+is:issue+is:open+created:>=" + date;
      return fetch(totalUrl, {
        headers: {
          Authorization: "token 5b74479959e6943672be005eed144377dfb957ad"
        }
      })
        .then(res => {
          return res.json();
        })
        .then(issuesObj => {
          let issues = issuesObj.items;
          console.log("IssuesObj", issuesObj);
          callback(null, {'success': true});
        });
    } else {
      setError(true);
      setErrorText("The input field cannot be left empty!");
    }
  };
  const handleKeyPress = event => {
    if (event.key === "Enter") {
      event.preventDefault();
      setLoading(true);
      setFoundResult(false);
      setIssuesInfo({
        total: 0,
        firstSeg: 0,
        secondSeg: 0,
        thirdSeg: 0
      });

      parallel({
        link1: function(callback){
          fetchIssues(1, callback);
        },
        link2: function(callback){
          fetchIssues(7, callback);
        },
        link3: function(callback){
          fetchTotalIssuesCount(callback);
        },
        link3: function(callback) {
          fetchPullRequestCount(callback);
        }
      },function(err,links){
        if(err){
          console.log('Noooooo');
        }
        else{
          console.log('THanks', links);
        }
      });


    }
  };

  const handleFetchClick = () => {
    setIssuesInfo({
      total: 0,
      firstSeg: 0,
      secondSeg: 0,
      thirdSeg: 0
    });
    fetchIssues(1);
    fetchIssues(7);
    fetchTotalIssuesCount();
    fetchPullRequestCount();
  }

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
                onClick={handleFetchClick}
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
