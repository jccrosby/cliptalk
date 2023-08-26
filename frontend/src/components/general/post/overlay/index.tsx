import { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import { Post, User } from "../../../../../types";
import { useSelector } from "react-redux";
import { throttle } from "throttle-debounce";
import { getLikeById, updateLike } from "../../../../services/posts";
import { RootState } from "../../../../redux/store";

/**
 * Function that renders a component meant to be overlapped on
 * top of the post with the post info like user's display name and avatar
 * and the post's description
 *
 * @param {User} user that created the post
 * @param {Post} post object
 */
export default function PostSingleOverlay({
  user,
  post,
}: {
  user: User;
  post: Post;
}) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const [currentLikeState, setCurrentLikeState] = useState({
    state: false,
    counter: post.likesCount,
  });

  useEffect(() => {
    if (currentUser) {
      getLikeById(post.id, currentUser.uid).then((res) => {
        setCurrentLikeState({
          ...currentLikeState,
          state: res,
        });
      });
    }
  }, []);

  /**
   * Handles the like button action.
   *
   * In order to make the action more snappy the like action
   * is optimistic, meaning we don't wait for a response from the
   * server and always assume the write/delete action is successful
   */
  const handleUpdateLike = useMemo(
    () =>
      throttle(500, (currentLikeStateInst: typeof currentLikeState) => {
        setCurrentLikeState({
          state: !currentLikeStateInst.state,
          counter:
            currentLikeStateInst.counter +
            (currentLikeStateInst.state ? -1 : 1),
        });
        if (currentUser) {
          updateLike(post.id, currentUser.uid, currentLikeStateInst.state);
        }
      }),
    []
  );

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>
      <View style={styles.leftContainer}>
        <Image style={styles.avatar} source={{ uri: user?.photoURL }} />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateLike(currentLikeState)}
        >
          <Ionicons
            color="white"
            size={40}
            name={currentLikeState.state ? "heart" : "heart-outline"}
          />
          <Text style={styles.actionButtonText}>
            {currentLikeState.counter}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}