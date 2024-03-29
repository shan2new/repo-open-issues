/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import moment from "moment";
import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Loader from "react-loader-spinner";
import GitHubMark from "./images/github_mark_light-lg.png";
import { parallel } from "async";

import UrlBar from "./containers/UrlBar";
const centerAlign = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)"
};

const App = () => {
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

  const fetchTotalIssuesCount = callback => {
    let totalUrl = "https://api.github.com/repos" + repoPath;
    console.log("Total URL", totalUrl, repoPath);
    return fetch(totalUrl, {
      headers: {
        Authorization: "token 7deef6c6ce33b86b1ca1cca06b7004bd8ac5e04d"
      }
    })
      .then(res => {
        return res.json();
      })
      .then(function(repoDetails) {
        if (repoDetails.message && repoDetails.message === "Not Found") {
          callback(true, null);
        } else {
          callback(null, repoDetails.open_issues_count);
        }
      });
  };

  const fetchPullRequestCount = callback => {
    let tempRepoPath = repoPath;
    if (repoPath[0] === "/") {
      tempRepoPath = repoPath.slice(1);
    }

    let totalUrl =
      "https://api.github.com/search/issues?q=repo:" +
      tempRepoPath +
      "+is:pr+is:open";
    return fetch(totalUrl, {
      headers: {
        Authorization: "token 7deef6c6ce33b86b1ca1cca06b7004bd8ac5e04d"
      }
    })
      .then(res => {
        return res.json();
      })
      .then(function(pullRequests) {
        if (
          pullRequests.message &&
          (pullRequests.message === "Not Found" ||
            pullRequests.message === "Validation Failed")
        ) {
          callback(true, null);
        } else {
          callback(null, pullRequests.total_count);
        }
      });
  };

  const fetchIssues = (days, callback) => {
    if (!days || typeof days !== "number") {
      days = 1;
    }
    let date = moment(new Date())
      .subtract(days, "days")
      .format("YYYY-MM-DD");
    if (error) {
      return;
    }

    if (repoPath) {
      let tempRepoPath = repoPath;
      if (repoPath[0] === "/") {
        tempRepoPath = repoPath.slice(1);
      }
      let totalUrl =
        "https://api.github.com/search/issues?q=repo:" +
        tempRepoPath +
        "+is:issue+is:open+created:>=" +
        date;
      return fetch(totalUrl, {
        headers: {
          Authorization: "token 7deef6c6ce33b86b1ca1cca06b7004bd8ac5e04d"
        }
      })
        .then(res => {
          return res.json();
        })
        .then(function(issuesObj) {
          if (
            issuesObj.message &&
            (issuesObj.message === "Not Found" ||
              issuesObj.message === "Validation Failed")
          ) {
            callback(true, null);
          } else {
            callback(null, issuesObj.total_count);
          }
        });
    } else {
      setError(true);
      setErrorText("The input field cannot be left empty!");
    }
  };

  const calculateFields = (
    firstSeg,
    allSecondSeg,
    totalIncludingPRs,
    totalPRs
  ) => {
    issueInfo.total = totalIncludingPRs - totalPRs;
    issueInfo.firstSeg = firstSeg;
    issueInfo.secondSeg = allSecondSeg - firstSeg;
    issueInfo.thirdSeg = issueInfo.total - allSecondSeg;
    setIssuesInfo(issueInfo);
  };

  useEffect(() => {
    if (!repoPath) {
      return;
    }

    parallel(
      {
        firstSegIssues: function(callback) {
          fetchIssues(1, callback);
        },
        allSecondSegIssues: function(callback) {
          fetchIssues(7, callback);
        },
        totalIssuesIncludingPRs: function(callback) {
          fetchTotalIssuesCount(callback);
        },
        totalPRs: function(callback) {
          fetchPullRequestCount(callback);
        }
      },
      function(err, issues) {
        if (err) {
          setError(true);
          setErrorText("Invalid Repository or Owner!");
          setLoading(false);
        } else {
          calculateFields(
            issues["firstSegIssues"],
            issues["allSecondSegIssues"],
            issues["totalIssuesIncludingPRs"],
            issues["totalPRs"]
          );
          setFoundResult(true);
          setLoading(false);
        }
      }
    );
  }, [repoPath]);

  const consolidatedFetch = path => {
    setRepoPath(path);
    setLoading(true);
    setFoundResult(false);
    setIssuesInfo({
      total: 0,
      firstSeg: 0,
      secondSeg: 0,
      thirdSeg: 0
    });
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
        <UrlBar triggerEvent={consolidatedFetch} resultError={errorText} />
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
                    <td align="center">{issueInfo.firstSeg}</td>
                    <td align="center">{issueInfo.secondSeg}</td>
                    <td align="center">{issueInfo.thirdSeg}</td>
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
