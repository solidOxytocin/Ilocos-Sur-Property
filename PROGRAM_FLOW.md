# PROGRAM FLOWS

    - This MD file shows the use flow app and the components inside of each module 

# ADMIN APP FLOW

Login ->
    VIEWS LISTING:

        1. Button Add 
            -View Form 
                -Header
                -Fields
                    -Must Ask for what details would be needed (required) and whats optional
                -Image Upload
            -Button Save
                -Field Checks (background)
                -Modal For Confirming Changes
                        -Refresh Current List(Take consider of filters)
            -Button Cancel
                -Modal For Confirming
                    -Takes back to listing


        2. View Listing (with default filter)
            -List (Highlight its Status)
            -Small Details
            -Thumbnail
            -Buttons To Change Status(if availble then button should be "sold" or "under neg.")
            -Pagination (background)
            
        3.Button Details 
            1.Button Edit Selected Detail
                -View Form of Edit Selected Details 
                    -Modal For Confirming Changes
                        -Refresh Current List(Take consider of filters)
            2.View Selected Detail
                -Texts
                -Gallery Image
                    -Carousel? 
                    -Full screen mode

        2.Button Delete Details
            -Modal Confirm Delete
                -Deletion
                -Refresh Current List (Take consider of filter)

        3.Button Edit Details (just copy from Add but inject data into the fields)
              -View Form 
                -Header
                -Fields
                    -Must Ask for what details would be needed (required) and whats optional
                -Image Upload
            -Button Save
                -Field Checks (background)
                -Modal For Confirming Changes
                        -Refresh Current List(Take consider of filters)
            -Button Cancel
                -Modal For Confirming
                    -Takes back to listing
        
        4. Button Filters
            -Modal Filter
                -Filters current List
        #. Button Settings
            -Later on Added
        #. Dashboard
            -later on added 
            -Shows the Analy. of sold ,unsold, added, etc of month etc. 

        
    

                        

# USER APP FLOW  

Login AND Guest -> 
        1. View Listing (with default filter)
            -List (Highlight its Status)
            -Small Details
            -Thumbnail
            -Buttons To Change Status(if availble then button should be "sold" or "under neg.")
            -Pagination (background)

        2. Button Details 
            2.View Selected Detail
                1.Texts
                2.Gallery Image
                    -Carousel? 
                    -Full screen mode
                3.Buttons
                    1. Inquire Property
                        -Contacts Modal
                            Icon Button:
                                1. Messenger
                                2. Mobile Phone
                                3. Instagram
                        -Socials
                            Icon Button:
                                1.FB
                                2.Insta
                                3.Tiktok
                    2. Interested Button 
                        For Logged in:
                            -interest count++
                            -then disables
                        For Guest:
                            -Redirect to Login
                            
        
        3.Button Filters
            -Modal Filter
                -Filters current List
        
        

