
// imports
import React, {useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { activeStorageUrlConverter, usersRoute, followersRoute } from '../railsRoutes';
import { Card, Segment, Image, Icon, Button }  from 'semantic-ui-react';
import { updateFollows } from '../redux/actions'
// end of imports --------------------------------------------------

const FollowList = (props) => {

    const artScopeJWT = localStorage.getItem('artScopeJWT');
    const [pageUser, setPageUser] = useState(null);
    const [loggedUserFollowingArray, setLoggedUserFollowingArray] = useState(props.loggedUser.isFollowing);

    const followHandler = (ID) => {
        const httpVerb = isViewerFollowing(ID) ? 'DELETE' : 'POST';
        const fetchConfig = {
            method: `${httpVerb}`,
            headers: {
                Authorization: `Bearer ${artScopeJWT}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                following_id: props.loggedUser.id,
                followed_id: ID
            })
        }

        fetch(followersRoute, fetchConfig)
        .then( response => response.json())
        .then(data => {
            props.updateFollowerState(ID)
            setLoggedUserFollowingArray(props.loggedUser.isFollowing)
        })
        
    }

    const isViewerFollowing = (viewingUserID) => {
        const idsOfFollowing = loggedUserFollowingArray.map(user => user.id)

        return idsOfFollowing.includes(viewingUserID)
    }

    const renderCardsFromUserData = (user) => {

        const listOfIds = user.user.isFollowing.map(user => user.id)
        
        return user.user[props.relationship].map(nestedUser => 
            (  
            
                <NavLink to={ `/home/user/${nestedUser.id}` } >
                    <Segment inverted style={{ height: 'fit', minWidth: '10%'}}>
                        
                        <Card style={{ margin: 'auto' }}>
                            <img src={activeStorageUrlConverter(nestedUser.proPic)} wrapped ui={false}  style={{ height: '20vh', objectFit: 'scale-down' }} />
                            <Card.Content>
                            <Card.Header>{nestedUser.username}</Card.Header>
                            <Card.Meta>
                                {listOfIds.includes(props.loggedUser.id) ? nestedUser.id === props.loggedUser.id ? 'This is you' : 'Follows You' : nestedUser.id === props.loggedUser.id ? 'This is you' : 'Does Not Follow You'}
                                <br></br>
                                {console.log('logged', props.loggedUser)}
                                {isViewerFollowing(nestedUser.id) ? 'You are Following' : nestedUser.id === props.loggedUser.id ? null : 'You are not Following'}
                            </Card.Meta>
                            <Card.Description>
                                <b>Short Bio:</b>
                                <br></br>
                                { nestedUser.bio }
                                <br></br>
                                {
                                    isViewerFollowing(nestedUser.id) ? (
                                        <Button 
                                            onClick={ e => {
                                                e.preventDefault()
                                                followHandler(nestedUser.id)
                                            }}
                                        >
                                            Unfollow
                                        </Button>   

                                    ) : props.loggedUser.id === nestedUser.id ? null : (
                                        <Button
                                        onClick={ e => {
                                            e.preventDefault()
                                            followHandler(nestedUser.id)
                                            }}
                                        >
                                            Follow
                                        </Button>
                                    )
                                } 
                            </Card.Description>
                            </Card.Content>
                        </Card>
                    </Segment>
                </NavLink>
        
        
            )
        )
    }

    const fetchUser = () => {

        const fetchConfig = {
            method: 'GET',
            headers: { Authorization:`Bearer ${artScopeJWT}` }

        }

        fetch(usersRoute + props.userID, fetchConfig)
        .then( response => response.json())
        .then(user => {
            setPageUser(user)
            props.setPageUserData({username: user.user.username, img: user.user.proPic})
        })
    }  

    useEffect(() => {
        fetchUser()
        console.log('change')
    }, [loggedUserFollowingArray])

    return (
        <>
            {
                pageUser ? (
                    renderCardsFromUserData(pageUser)
                ) : null
            }
        </>
    )
}

const msp = state =>  ({ loggedUser: state.user.user })

const mdp = dispatch => ({updateFollowerState: (id) => dispatch(updateFollows(id)) });

export default connect(msp, mdp)(FollowList);