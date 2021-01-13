import React, { useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';

import { connect } from 'react-redux';
import { Card, Icon, Button } from 'semantic-ui-react';
import { updateUserLikes } from '../redux/actions';
import { likedPostsRoute, activeStorageUrlConverter } from '../railsRoutes';

import {
  postPreviewCard,
  postPreviewImage,

} from '../bigStyle';

// renders a card with a img preview, handles liking/unlking and navlinks to post show page onclick
const PostPreview = (props) => {
  // auth token
  const artScopeJWT = localStorage.getItem('artScopeJWT');

  // for access to history
  const history = useHistory();

  // we do a local state for like count since its not the most important information to update in realtime...probably should be moved to redux store eventually
  const [likedPostsCounter, setLikedPostsCounter] = useState(props.data.subs.length);

  // returns bool if logged user owns post being viewed
  const doesPostBelongToLoggedUser = () => props.data.ownerID === props.loggedUser.id;

  // checks if the logged User has liked previewed post or not
  const hasUserLikedPost = () => {
    let liked = false;

    props.reduxLikedPosts.forEach((post) => {
      if (post.id === props.data.id) liked = true;
    });

    return liked;
  };

  // creates or destroys liked relationship
  const likePost = (e) => {
    e.preventDefault();

    const httpVerb = hasUserLikedPost() ? 'DELETE' : 'POST';

    const fetchConfig = {
      method: `${httpVerb}`,
      headers: {
        Authorization: `Bearer ${artScopeJWT}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: props.loggedUser.id, post_id: props.data.id }),
    };

    fetch(likedPostsRoute, fetchConfig)
      .then((response) => response.json())
      .then((json) => {
        // updating render, props.upateCurrentUserLikes is a redux action and maintains that state in store likeCounter is local state
        if (json.message === 'created') {
          props.updateCurrentUserLikes(props.data.id);
          setLikedPostsCounter((current) => current + 1);
        } else if (json.message === 'deleted') {
          props.updateCurrentUserLikes(props.data.id);
          setLikedPostsCounter((current) => current - 1);
        }
      });
  };

  return (
    <div>

      <NavLink to={`/home/post/${props.data.id}`}>

        <Card style={postPreviewCard} onClick={() => null}>

          <img
            src={activeStorageUrlConverter(props.data.img)}
            wrapped
            ui={false}
            style={postPreviewImage}
            alt="post preview"
          />

          <Card.Content>
            <Card.Header>{props.data.title}</Card.Header>
          </Card.Content>

          <Card.Content extra onClick={(e) => likePost(e)}>

            {!hasUserLikedPost() ? (
              <Icon name="heart" />
            ) : (
              <Icon color="red" name="heart" />
            )}

            {`Likes ${likedPostsCounter}`}
          </Card.Content>

          {doesPostBelongToLoggedUser() ? (
            <>
              <br />
              <Button
                icon
                onClick={
                                            (e) => {
                                              e.preventDefault();
                                              history.push(`/home/post/edit/${props.data.id}`);
                                            }
                                        }
              >
                <Icon name="edit" />
                edit my post
              </Button>

            </>
          ) : (
            null
          )}
        </Card>
      </NavLink>
    </div>
  );
};

const msp = (state) => ({
  loggedUser: state.user.user,
  reduxLikedPosts: state.user.user.likedPosts,
});

const mdp = (dispatch) => ({
  updateCurrentUserLikes: (newLikeID) => dispatch(updateUserLikes(newLikeID)),
});

export default connect(msp, mdp)(PostPreview);
