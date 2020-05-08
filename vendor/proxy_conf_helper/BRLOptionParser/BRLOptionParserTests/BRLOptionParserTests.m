#import <Kiwi/Kiwi.h>
#import "BRLOptionParser.h"


SPEC_BEGIN(BRLOptionParserSpec)

describe(@"BRLOptionParser", ^{
    __block BRLOptionParser *options;
    __block NSError *error;

    beforeEach(^{
        optind = 1;
        options = [BRLOptionParser new];
        error = nil;
    });

    context(@"parsing", ^{
        context(@"options without arguments", ^{
            __block BOOL flag;
            __block char * argument;

            beforeEach(^{
                flag = NO;
                argument = "-h";
            });

            it(@"calls blocks", ^{
                [options addOption:NULL flag:'h' description:nil block:^{
                    flag = YES;
                }];
            });

            it(@"casts boolean values", ^{
                [options addOption:NULL flag:'h' description:nil value:&flag];
            });

            context(@"long options", ^{
                beforeEach(^{
                    argument = "--help";
                });

                it(@"calls blocks", ^{
                    [options addOption:"help" flag:0 description:nil block:^{
                        flag = YES;
                    }];
                });

                it(@"casts boolean values", ^{
                    [options addOption:"help" flag:0 description:nil value:&flag];
                });

                context(@"with short aliases", ^{
                    it(@"calls blocks", ^{
                        [options addOption:"help" flag:'h' description:nil block:^{
                            flag = YES;
                        }];
                    });

                    it(@"casts boolean values", ^{
                        [options addOption:"help" flag:'h' description:nil value:&flag];
                    });

                    afterEach(^{
                        int argc = 2;
                        const char * argv[] = {"app", "-h", 0};
                        [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
                        [[error should] beNil];
                    });
                });
            });

            afterEach(^{
                int argc = 2;
                const char * argv[] = {"app", argument, 0};
                [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
                [[error should] beNil];
                [[@(flag) should] beYes];
            });
        });

        context(@"options with arguments", ^{
            __block NSString *string;
            __block char * argument;

            beforeEach(^{
                string = nil;
                argument = "-H";
            });

            context(@"that are set", ^{
                it(@"calls blocks with arguments", ^{
                    [options addOption:NULL flag:'H' description:nil blockWithArgument:^(NSString *value) {
                        string = value;
                    }];
                });

                it(@"casts string arguments", ^{
                    [options addOption:NULL flag:'H' description:nil argument:&string];
                });

                context(@"long options", ^{
                    beforeEach(^{
                        argument = "--hello";
                    });

                    it(@"calls blocks with arguments", ^{
                        [options addOption:"hello" flag:0 description:nil blockWithArgument:^(NSString *value) {
                            string = value;
                        }];
                    });

                    it(@"casts string arguments", ^{
                        [options addOption:"hello" flag:0 description:nil argument:&string];
                    });

                    context(@"with short aliases", ^{
                        it(@"calls blocks with arguments", ^{
                            [options addOption:"hello" flag:'H' description:nil blockWithArgument:^(NSString *value) {
                                string = value;
                            }];
                        });

                        it(@"casts string arguments", ^{
                            [options addOption:"hello" flag:'H' description:nil argument:&string];
                        });

                        afterEach(^{
                            int argc = 3;
                            const char * argv[] = {"app", "-H", "world", 0};
                            [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
                            [[error should] beNil];
                        });
                    });
                });

                afterEach(^{
                    int argc = 3;
                    const char * argv[] = {"app", argument, "world", 0};
                    [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
                    [[error should] beNil];
                    [[string should] equal:@"world"];
                });
            });

            context(@"that are missing", ^{
                __block BOOL flag = NO;

                beforeEach(^{
                    [options addOption:"hello" flag:'H' description:nil argument:&string];
                    [options addOption:"verbose" flag:'v' description:nil value:&flag];
                });

                it(@"fails with a short option", ^{
                    int argc = 2;
                    const char * argv[] = {"app", "-vH", 0};
                    [[@([options parseArgc:argc argv:argv error:&error]) should] beNo];
                    [[error shouldNot] beNil];
                    [[@([error code]) should] equal:@(BRLOptionParserErrorCodeRequired)];
                    [[[error localizedDescription] should] equal:@"option `-H' requires an argument"];
                });

                it(@"fails with a long option", ^{
                    int argc = 3;
                    const char * argv[] = {"app", "--verbose", "--hello", 0};
                    [[@([options parseArgc:argc argv:argv error:&error]) should] beNo];
                    [[error shouldNot] beNil];
                    [[@([error code]) should] equal:@(BRLOptionParserErrorCodeRequired)];
                    [[[error localizedDescription] should] equal:@"option `--hello' requires an argument"];
                });
            });
        });

        context(@"unrecognized arguments", ^{
            it(@"fails with a short option", ^{
                BOOL flag = NO;
                [options addOption:NULL flag:'h' description:nil value:&flag];
                int argc = 2;
                const char * argv[] = {"app", "-hi", 0};
                [[@([options parseArgc:argc argv:argv error:&error]) should] beNo];
                [[error shouldNot] beNil];
                [[@([error code]) should] equal:@(BRLOptionParserErrorCodeUnrecognized)];
                [[[error localizedDescription] should] equal:@"unrecognized option `-i'"];
            });

            it(@"fails with a long option", ^{
                int argc = 2;
                const char * argv[] = {"app", "--hello=world", 0};
                [[@([options parseArgc:argc argv:argv error:&error]) should] beNo];
                [[error shouldNot] beNil];
                [[@([error code]) should] equal:@(BRLOptionParserErrorCodeUnrecognized)];
                [[[error localizedDescription] should] equal:@"unrecognized option `--hello'"];
            });
        });

        context(@"long-only", ^{
            beforeEach(^{
                options.longOnly = YES;
            });

            it(@"works", ^{
                BOOL flag = NO;
                [options addOption:"help" flag:0 description:nil value:&flag];
                int argc = 2;
                const char * argv[] = {"app", "-help", 0};
                [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
                [[error should] beNil];
                [[@(flag) should] beYes];
            });

            context(@"with arguments", ^{
                it(@"fails with a proper error", ^{
                    NSString *string = nil;
                    [options addOption:"hello" flag:0 description:nil argument:&string];
                    int argc = 2;
                    const char * argv[] = {"app", "-hello", 0};
                    [[@([options parseArgc:argc argv:argv error:&error]) should] beNo];
                    [[error shouldNot] beNil];
                    [[@([error code]) should] equal:@(BRLOptionParserErrorCodeRequired)];
                    [[[error localizedDescription] should] equal:@"option `-hello' requires an argument"];
                });
            });
        });

        it(@"works with a separator", ^{
            [options addSeparator];
            int argc = 1;
            const char * argv[] = {"app", 0};
            [[@([options parseArgc:argc argv:argv error:&error]) should] beYes];
            [[error should] beNil];
        });
    });

    context(@"usage", ^{
        context(@"banner", ^{
            it(@"prints by default", ^{
                NSString *usage =
                @"usage: xctest [options]\n";

                [[NSProcessInfo processInfo] stub:@selector(processName) andReturn:@"xctest"];
                [[[options description] should] equal:usage];
            });

            it(@"prints custom overrides", ^{
                NSString *usage =
                @"usage: expected [OPTIONS]\n";

                [options setBanner:@"usage: expected [OPTIONS]"];

                [[[options description] should] equal:usage];
            });
        });

        context(@"help", ^{
            beforeEach(^{
                [options setBanner:@"usage: app [options]"];
                [options addOption:"a-really-long-option-that-overflows" flag:0 description:@"Is described over here" value:NULL];
                [options addOption:NULL flag:'0' description:nil value:NULL];
                [options addSeparator];
                [options addSeparator:@"Other options:"];
                [options addOption:"version" flag:0 description:@"Show version" value:NULL];
                [options addOption:"help" flag:'h' description:@"Show this screen" value:NULL];
            });

            it(@"prints and formats options", ^{
                NSString *usage =
                @"usage: app [options]\n"
                @"        --a-really-long-option-that-overflows\n"
                @"                                     Is described over here\n"
                @"    -0\n"
                @"\n"
                @"Other options:\n"
                @"        --version                    Show version\n"
                @"    -h, --help                       Show this screen\n";

                [[[options description] should] equal:usage];
            });

            context(@"long-only", ^{
                beforeEach(^{
                    options.longOnly = YES;
                });

                it(@"prints and formats long options with a single hyphen", ^{
                    NSString *usage =
                    @"usage: app [options]\n"
                    @"        -a-really-long-option-that-overflows\n"
                    @"                                     Is described over here\n"
                    @"    -0\n"
                    @"\n"
                    @"Other options:\n"
                    @"        -version                    Show version\n"
                    @"    -h, -help                       Show this screen\n";

                    [[[options description] should] equal:usage];
                });
            });
        });
    });
});

SPEC_END
