import React from "react";

import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";
import Form from "react-bootstrap/Form";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Motion, spring } from "react-motion";

const config = { stiffness: 140, damping: 14 };
const toCSS = scale => ({
  transform: `scale3d(${scale}, ${scale}, ${scale})`
});

const UrlBar = props => (
  <Form>
    <Row>
      <Col>
        <InputGroup className="mb-3">
          <FormControl
            id="basic-url"
            aria-describedby="basic-addon3"
            placeholder="example: https://github.com/facebook/react"
            onKeyPress={props.handleKeyPress}
            value={props.inputURL}
            onChange={props.handleChange}
          />
        </InputGroup>
      </Col>
    </Row>
    {props.error ? (
      <Motion defaultStyle={{ scale: 0 }} style={{ scale: spring(1, config) }}>
        {value => (
          <div className="box" style={toCSS(value.scale)}>
            <Row>
              <Col>
                <Form.Text className="text-light">{props.errorText}</Form.Text>
              </Col>
            </Row>
          </div>
        )}
      </Motion>
    ) : null}
    <Row>
      <Col className="justify-content-center d-flex" xs={12}>
        <Button
          onClick={props.handleButtonClick}
          className="text-uppercase"
          style={{ fontWeight: 600 }}
        >
          Fetch Issues Information
        </Button>
      </Col>
    </Row>
  </Form>
);

export default UrlBar;
