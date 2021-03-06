import React from "react";

import { fetchList, fetchPostsByCategorySlug, fetchUserInfo } from "./data";
import s from "./Blogpage.module.scss";
import draftToHtml from "../../../vendor/draftjs-to-html";
import { htmlToText } from "html-to-text";
import { withRouter } from "react-router";

export class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      list: [],
    };
    this.handleNewPost = this.handleNewPost.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.getReactElement = this.getReactElement.bind(this);
  }

  async componentDidMount() {
    this.setState({
      userInfo: await fetchUserInfo(),
    });
    await this.updateListView();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match.params.slug !== this.props.match.params.slug) {
      await this.updateListView();
    }
  }

  componentWillUnmount() {
    //window.document.removeEventListener('keyup', this.handleOnKeyUp)
  }

  async updateListView() {
    try {
      const slug = this.props.match.params.slug;
      if (slug) {
        this.setState({
          list: await fetchPostsByCategorySlug({ categorySlug: slug }),
        });
      } else {
        this.setState({
          list: await fetchList(),
        });
      }
    } catch (error) {}
  }

  handleNewPost() {
    this.props.history.push("/blog/new-post");
  }

  getReactElement(a) {
    const htmlBlogContent = draftToHtml(a);
    const plainText = htmlBlogContent.replace(/<[^>]*>/g, "");
    return htmlToText(plainText);
  }

  render() {
    return (
      <div>
        {this.state.userInfo.status === "LOGGED_IN" ? (
          <button
            style={{
              float: "right",
              marginBottom: "1rem",
              marginRight: "1rem",
              backgroundColor: "#395F86",
              border: "none",
              color: "white",
              padding: "10px 30px",
              textAlign: "center",
              fontSize: "14px",
            }}
            onClick={this.handleNewPost}
            title="newPostButton"
          >
            New Post
          </button>
        ) : (
          <div></div>
        )}

        <div style={{ clear: "both" }} />

        <div className={s.List}>
          {this.state.list.map((blogpost) => (
            <div key={blogpost.id} className={s.Content}>
              <h2 title="blogpostTitle" className={s.blogpostTitle}>
                <a href={`/blog/${blogpost.slug}`}>{blogpost.title}</a>
              </h2>
              <div title="blogpostPreview">
                <img alt="" src={blogpost.image} />
                {this.getReactElement(blogpost.blogpostcontent)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(ListView);
