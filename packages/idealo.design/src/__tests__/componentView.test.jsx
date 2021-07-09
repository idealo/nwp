import {fetchUserInfo} from "../ui/pages/BlogPage/data";
import {fetchComponents, fetchTags, fetchMap} from "../ui/pages/ComponentsPage/component_data";
import {render, screen, waitFor} from "@testing-library/react";
import {ComponentView} from "../ui/pages/ComponentsPage/ComponentView";
import '@testing-library/jest-dom/extend-expect';
import React from "react";

jest.mock('../ui/pages/BlogPage/data', () => {
    return {fetchUserInfo: jest.fn()};
});

jest.mock('../ui/pages/ComponentsPage/component_data', () => {
    return {fetchComponents: jest.fn(), fetchTags: jest.fn(), fetchMap: jest.fn(), fetchSingleComponent: jest.fn()};
});

test('ComponentView gets rendered with user logged in', async () => {
    const mockupComponent = [{
        "component_id": 123,
        "title": "@motif/button",
    }]

    const mockupTags = [
        {"tag_name": "motif"},
        {"tag_name": "motif-ui"},
        {"tag_name": "button"},
        {"tag_name": "react"}
    ]

    const mockupMap = [{
        "component_id": 123,
        "title": "@motif/button",
        "tag_name": "motif"
    }]

    const userInfo = {
        "status": "LOGGED_IN",
        "user": {
            "@odata.context": null,
            "businessPhones": [],
            "displayName": null,
            "givenName": null,
            "jobTitle": null,
            "mail": null,
            "mobilePhone": null,
            "officeLocation": null,
            "preferredLanguage": null,
            "surname": null,
            "userPrincipalName": null,
            "id": null
        }
    };

    fetchUserInfo.mockReturnValue(userInfo)
    fetchComponents.mockReturnValue(mockupComponent)
    fetchTags.mockReturnValue(mockupTags)
    fetchMap.mockReturnValue(mockupMap)

    render(<ComponentView/>)

    await waitFor(() => {
        const componentTitle = screen.getByTitle('componentTitle')
        expect(componentTitle).toBeInTheDocument()

        const componentTags = screen.getByTitle('componentTags')
        expect(componentTags).toBeInTheDocument()
    })

})
