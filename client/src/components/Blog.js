import React,{ useContext } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

import Context from './../context'
import NoContent from './Pin/NoContent'
import CreatePin from './Pin/CreatePin'
import PinContent from './Pin/PinContent'
import { unstable_useMediaQuery as useMediaQuery  } from "@material-ui/core/useMediaQuery";

let mobileSize = null

const Blog = ({ classes }) => {

  const { state } = useContext(Context)
  const { draftPin, currentPin } = state
	mobileSize = useMediaQuery("(max-width: 650px)")

  let BlogContent

  if(!draftPin && !currentPin) {
    BlogContent = NoContent
  } else if(draftPin && !currentPin) {
    BlogContent = CreatePin
  } else if(!draftPin && currentPin) {
    BlogContent = PinContent
  }

  return (
    <Paper className={mobileSize ? classes.root : classes.root}>
      <BlogContent />
    </Paper>
  )
};

const styles = {
  root: {
    minWidth: 350,
    maxWidth: mobileSize ? "400" : "100vw",
    maxHeight: "calc(100vh - 64px)",
    overflowY: "scroll",
    display: "flex",
    justifyContent: "center"
  },
  rootMobile: {
    maxWidth: "100%",
    maxHeight: 300,
    overflowX: "hidden",
    overflowY: "scroll"
  }
};

export default withStyles(styles)(Blog);
