
import { connect } from 'react-redux';
import PostPreview from '../components/PostPreview';
import { updateFollows } from '../redux/actions';
import { followersRoute } from '../railsRoutes';
import UserShellContainer from './UserShellContainer';

// I normally like to write all functional components but wanted to demonstrate knowledge of also classes too!
// I used UserShellContainer as a parent for UserLikedContainer and UserPostContainer since they are so similair
// however I dont think class based inheritance played nice with redux so that was challenging
class UserPostContainer extends UserShellContainer {
    
    // for user header
    headerChange = 'Page:';

    // checks if logged in user is following the previewed user
    isLoggedUserFollowingPreviewedUser = () => {

        const idsOfFollowing = this.props.loggedUser.isFollowing.map(user => user.id);
  
        return idsOfFollowing.includes(this.state.user.id);
    };
    
    // checks if the logged in user is the previewed user
    isLoggedUserViewingSelf = () => this.props.loggedUser.id === this.state.user.id;
    
    followHandler = () => {

        const httpVerb = this.isLoggedUserFollowingPreviewedUser() ? 'DELETE' : 'POST';

        const fetchConfig = {
            method: `${httpVerb}`,
            headers: {
                Authorization: `Bearer ${this.state.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                following_id: this.props.loggedUser.id,
                followed_id: this.state.user.id
            })
        };

        fetch(followersRoute, fetchConfig)
        .then( response => response.json())
        .then(data => {
            this.props.updateFollowerState(this.state.user.id);
            this.setState({loggedUser: this.props.loggedUser});
        });
        
    };

    // maps over provided users posts and creates PostPreview Components from the data
    renderPostPreviewsFromUserData = () => {
        return this.state.user.posts.map( postData => <PostPreview key={postData.id} data={postData} userID={this.props.userID} />)
    }
};
const msp = state => ({loggedUser: state.user.user});

const mdp = dispatch => ({
    updateFollowerState: (id) => dispatch(updateFollows(id))
});

export default connect(msp, mdp)(UserPostContainer);