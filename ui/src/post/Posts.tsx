import {FC} from "react";
import {PostDto} from "./PostDto";
import {useInfiniteQuery} from "@tanstack/react-query";
import {Post} from "./Post";
import InfiniteScroll from "react-infinite-scroll-component";
import {createQueryParams} from "../util/Utils";
import {Loading} from "../util/Loading";

export const Posts: FC = () => {

    const fetchPosts = ({pageParam: lastId = undefined}): Promise<PostDto[]> => {
        const params = {
            pageSize: 10,
            lastId
        }

        return fetch(`api/posts?${createQueryParams(params)}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw response.statusText;
                }
            });
    };

    const {
        isLoading,
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery(['posts'], fetchPosts, {
        getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.id,
    })

    if (isLoading) {
        return (<Loading/>);
    }

    if (error) {
        console.error(error)
    }

    const posts = data?.pages.flat() || [];

    return (
        <InfiniteScroll
            dataLength={posts.length}
            next={fetchNextPage}
            hasMore={hasNextPage || isFetchingNextPage}
            loader={<Loading/>}
            endMessage={
                <p style={{textAlign: 'center'}}>
                    <b>Yay! you're all caught up.</b>
                </p>
            }
        >
            {posts.map(post => <Post key={post.id} post={post}/>)}
        </InfiniteScroll>
    );
}