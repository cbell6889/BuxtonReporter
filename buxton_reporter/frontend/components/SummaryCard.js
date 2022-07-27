import React from 'react';
import {Box, Heading, Select, Switch, Label, Button, useBase, useRecords} from '@airtable/blocks/ui'


const SummaryCard = (props) => {

    return (
        <Box
            // className={props.cardClass}
            height={250}
            width={250}
            backgroundColor="white"
            borderRadius="large"
            overflow="hidden"
            boxShadow="1px 1px 15px 0 rgba(0,0,0,0.08);"
            display="flex"
            justifyContent="center"
            alignItems="center"
        >
            <Label Label size="large" textColor="light" marginLeft={1}>
                {props.cardLabel}
            </Label>
            <Box
                display="flex"
                flexDirection="column"
                padding={2}
                justifyContent="center"
                alignItems="center"
            >
                <Box flex="1 1 auto">
                    <Heading size="xxlarge" textColor={props.countColour}>
                        {props.recordCount}
                    </Heading>
                </Box>
                <Box flex="1 1 auto" className="cardCounterLabel">
                    <Heading textColor="light">{props.recordTitle}</Heading>
                </Box>
            </Box>
        </Box>


    )

}

export default SummaryCard;