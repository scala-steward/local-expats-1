import IconButton from "@mui/material/IconButton";
import {Badge, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import {Notifications, QuestionAnswer} from "@mui/icons-material";
import React, {FC, useState} from "react";
import {get} from "../util/Fetch";
import {PostDto} from "../post/PostDto";
import {useQuery} from "@tanstack/react-query";
import {usePostBookmarks} from "../post/PostBookmarks";
import Tooltip from "@mui/material/Tooltip";
import {PostLink} from "../post/PostLink";
import {useSmallScreen} from "../util/useUtils";

export const Notification: FC = () => {
    const {postIds, notificationsLastChecked, updateNotificationsLastChecked} = usePostBookmarks();
    const ids = postIds.join(',');
    const fetchUpdatedPosts = () => {
        if (!postIds.length) {
            return Promise.resolve([]);
        }
        return get<PostDto[]>('/api/posts/updated', {
            ids,
            since: notificationsLastChecked,
        });
    };
    const {data, refetch} = useQuery(['notifications'], fetchUpdatedPosts, {
        refetchInterval: 2 * 60 * 1000, // 2 minutes
    });

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        void refetch();
        handleOpenUserMenu(event);
        updateNotificationsLastChecked();
    }

    const smallScreen = useSmallScreen();
    const updatedPosts = data ?? [];
    return (
        <>
            <Tooltip title="Show notifications">
                <IconButton onClick={handleNotificationClick}
                            size="large"
                            color="inherit"
                >
                    <Badge badgeContent={updatedPosts.length} color="info">
                        <Notifications/>
                    </Badge>
                </IconButton>
            </Tooltip>
            <Menu
                sx={{mt: 5}}
                anchorEl={anchorElUser}
                keepMounted
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                PaperProps={{
                    style: {
                        width: smallScreen ? '100%' : '350px'
                    }
                }}
            >
                {updatedPosts.map((post) => (
                    <PostLink post={post} key={post.id}>
                        <MenuItem onClick={handleCloseUserMenu}>
                            <ListItemIcon>
                                <Badge badgeContent={post.noOfComments} color="info">
                                    <QuestionAnswer fontSize="small"/>
                                </Badge>
                            </ListItemIcon>
                            <ListItemText secondary={post.title} secondaryTypographyProps={{noWrap: true}}/>
                        </MenuItem>
                    </PostLink>
                ))}
                {updatedPosts.length === 0 &&
                    <MenuItem onClick={handleCloseUserMenu}>
                        <ListItemText primary="No new notifications at this time."
                                      secondary="Bookmark posts to get notified.">
                        </ListItemText>
                    </MenuItem>
                }
            </Menu>
        </>
    );
}