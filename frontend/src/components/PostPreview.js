//imports
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUserLikes } from '../redux/actions'
import { likedPostsRoute } from '../railsRoutes';


import { activeStorageUrlConverter } from '../railsRoutes';
import canvasTexture from '../images/canvas.jpg'

import { Card, Icon } from 'semantic-ui-react';
// end of imports -------------------------------------------------------

// renders a card with a img preview, handles liking/unlking and navlinks to post show page onclick
const PostPreview = (props) => {

    // auth token
    const artScopeJWT = localStorage.getItem('artScopeJWT');

    // we do a local state for like count since its not the most important information to update in realtime...probably should be moved to redux store eventually
    const [likedPostsCounter, setLikedPostsCounter] = useState(props.data.subs.length)

    
    // checks if we have liked this post or not
    const hasUserLikedPost = () => {
        let liked = false;

        props.reduxLikedPosts.forEach( post => {
            if (post.id === props.data.id) liked = true;
        })

        return liked;
    }

    // creates or destroys liked relationship in backend components should update
    const likePost = e => {
        // disables the outer NavLink
        e.preventDefault();

        const httpVerb = hasUserLikedPost() ? 'DELETE' : 'POST'
        const fetchConfig = {
            method: `${httpVerb}`, 
            headers: { 
                Authorization: `Bearer ${artScopeJWT}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: props.user.user.id, post_id: props.data.id })
        }

        fetch(likedPostsRoute, fetchConfig)
        .then( response => response.json() )
        .then(json => {
            
            //updating render, props.upateCurrentUserLikes is a redux action and maintains that state in store likeCounter is local state
            if (json.message === 'created') {
                
                props.updateCurrentUserLikes(props.data.id)
                setLikedPostsCounter(current => current + 1 )

            } else if (json.message === 'deleted') {
                props.updateCurrentUserLikes(props.data.id)
                setLikedPostsCounter(current => current - 1 )
                
            }
        })

    }

    return(
        <div>
            {console.log(props.reduxLikedPosts)}
            <NavLink to={`/home/post/${props.data.id}`}>
                <Card style={{ height: '300px', marginTop: 0 }} onClick={ () => null } >
                    <img src={activeStorageUrlConverter(props.data.img)} wrapped ui={false} style={{ height: '50%', objectFit: 'scale-down', backgroundImage: `url(${canvasTexture})`}}/>
                    <Card.Content>
                        <Card.Header>{props.data.title}</Card.Header>
                    </Card.Content>
                    <Card.Content extra onClick ={ e => likePost(e) } >

                        { !hasUserLikedPost() ? <Icon name='heart' /> : <Icon color='red' name='heart' /> }

                        {`Likes ${likedPostsCounter}`}
                    </Card.Content>
                </Card>
            </NavLink>
       
        </div>
    )
}

const msp = state => ({ user: state.user, reduxLikedPosts: state.user.user.likedPosts });
const mdp = dispatch => ({ updateCurrentUserLikes: (newLikeID) => dispatch(updateUserLikes(newLikeID)) });
export default connect(msp, mdp)(PostPreview);